import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import configFile from '../../firebase-applet-config.json';

const config = {
  ...configFile,
  apiKey: configFile.apiKey || "AIzaSyBfdM6h6xvWNYR0uGorw71knrR201fadOM",
  authDomain: configFile.authDomain || "gen-lang-client-0668341047.firebaseapp.com",
  projectId: configFile.projectId || "gen-lang-client-0668341047",
  storageBucket: configFile.storageBucket || "gen-lang-client-0668341047.firebasestorage.app",
  messagingSenderId: configFile.messagingSenderId || "320967705280",
  appId: configFile.appId || "1:320967705280:web:8002acbb6d3436e56a6325"
};

export const firebaseConfig = config;

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
export const auth = getAuth(app);

// Initialize Firestore with multi-tab support and instant real-time live synchronization
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase setPersistence warning:', err);
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // Don't re-throw for transient network errors, just log them
  if (!errInfo.error.includes('unavailable')) {
      throw new Error(JSON.stringify(errInfo));
  }
}

async function testConnection() {
  try {
    const docRef = doc(db, 'system', 'status');
    await getDocFromServer(docRef).catch(() => {});
  } catch (error) {
    // Silent catch
  }
}

testConnection();
