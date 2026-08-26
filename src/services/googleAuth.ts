import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase only if config has project id
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file'); 

const TOKEN_STORAGE_KEY = 'labmedix_gdrive_token';
const TOKEN_EXPIRY_KEY = 'labmedix_gdrive_token_expiry';

let isSigningIn = false;
let cachedAccessToken: string | null = null;

const getValidStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (token && expiry) {
      if (Date.now() < Number(expiry)) {
        return token;
      }
    }
  } catch (e) {
    console.warn('LocalStorage error reading Google token:', e);
  }
  return null;
};

const setStoredToken = (token: string, expiresInSeconds: number = 3600) => {
  try {
    const expiresAt = Date.now() + (expiresInSeconds - 300) * 1000; // 5 mins safety window
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiresAt));
  } catch (e) {
    console.warn('LocalStorage error saving Google token:', e);
  }
};

const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (e) {
    console.warn('LocalStorage error clearing Google token:', e);
  }
};

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Check valid stored token on startup
  const validStoredToken = getValidStoredToken();
  if (validStoredToken) {
    cachedAccessToken = validStoredToken;
    // Tell the backend server immediately about the restored token
    fetch('/api/backup/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: {}, googleToken: validStoredToken })
    }).catch(console.error);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    const currentToken = cachedAccessToken || getValidStoredToken();
    if (user && currentToken) {
      cachedAccessToken = currentToken;
      if (onAuthSuccess) onAuthSuccess(user, currentToken);
    } else if (user && !currentToken) {
      // User is logged into Firebase but Google Drive OAuth token isn't cached or stored
      if (onAuthFailure) onAuthFailure();
    } else {
      cachedAccessToken = null;
      clearStoredToken();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    setStoredToken(cachedAccessToken, 3600);

    // Tell the server about the token immediately
    fetch('/api/backup/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: {}, googleToken: cachedAccessToken })
    }).catch(console.error);

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken || getValidStoredToken();
};

export const googleLogout = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    console.warn('Firebase signout warning:', e);
  }
  cachedAccessToken = null;
  clearStoredToken();
  fetch('/api/backup/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {}, googleToken: null, disconnect: true })
  }).catch(console.error);
};
