import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebaseService';

export const firestoreService = {
  // Generic Read with Real-time Listener
  subscribeToCollection: <T>(
    collectionName: string, 
    callback: (data: T[]) => void, 
    ...constraints: QueryConstraint[]
  ) => {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    });
  },

  // Generic Get Single Document
  getDocument: async <T>(collectionName: string, docId: string): Promise<T | null> => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  // Generic Get Entire Collection
  getCollection: async <T>(collectionName: string, ...constraints: QueryConstraint[]): Promise<T[]> => {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (err) {
      console.error(`Error fetching collection ${collectionName}:`, err);
      return [];
    }
  },

  // Generic Set Document (Create or Overwrite)
  setDocument: async (collectionName: string, docId: string, data: any): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  },

  // Generic Update Document
  updateDocument: async (collectionName: string, docId: string, data: any): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  // Generic Delete Document
  deleteDocument: async (collectionName: string, docId: string): Promise<void> => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }
};
