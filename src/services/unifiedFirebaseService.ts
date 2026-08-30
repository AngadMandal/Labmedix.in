import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db } from './firebaseService';
import { Patient, HealthCard, PatientAppointment } from '../types';

export class UnifiedFirebaseService {
  /** Real-time subscriber for Patients */
  public static subscribeToPatients(callback: (patients: Patient[]) => void): () => void {
    try {
      const q = query(collection(db, 'patients'));
      return onSnapshot(q, (snapshot) => {
        const patients: Patient[] = [];
        snapshot.forEach((docSnap) => {
          patients.push({ id: docSnap.id, ...docSnap.data() } as unknown as Patient);
        });
        callback(patients);
      }, (error) => {
        console.warn('[UnifiedFirebase] Patients snapshot error:', error);
      });
    } catch (e) {
      console.warn('[UnifiedFirebase] Failed to subscribe to patients:', e);
      return () => {};
    }
  }

  /** Real-time subscriber for Health Cards */
  public static subscribeToCards(callback: (cards: HealthCard[]) => void): () => void {
    try {
      const q = query(collection(db, 'cards'));
      return onSnapshot(q, (snapshot) => {
        const cards: HealthCard[] = [];
        snapshot.forEach((docSnap) => {
          cards.push({ id: docSnap.id, ...docSnap.data() } as unknown as HealthCard);
        });
        callback(cards);
      }, (error) => {
        console.warn('[UnifiedFirebase] Cards snapshot error:', error);
      });
    } catch (e) {
      console.warn('[UnifiedFirebase] Failed to subscribe to cards:', e);
      return () => {};
    }
  }

  /** Real-time subscriber for Appointments */
  public static subscribeToAppointments(callback: (appointments: PatientAppointment[]) => void): () => void {
    try {
      const q = query(collection(db, 'appointments'));
      return onSnapshot(q, (snapshot) => {
        const appointments: PatientAppointment[] = [];
        snapshot.forEach((docSnap) => {
          appointments.push({ id: docSnap.id, ...docSnap.data() } as unknown as PatientAppointment);
        });
        callback(appointments);
      }, (error) => {
        console.warn('[UnifiedFirebase] Appointments snapshot error:', error);
      });
    } catch (e) {
      console.warn('[UnifiedFirebase] Failed to subscribe to appointments:', e);
      return () => {};
    }
  }

  /** Save or update Patient in Firestore */
  public static async savePatient(patient: Patient): Promise<boolean> {
    try {
      const docRef = doc(db, 'patients', patient.id);
      await setDoc(docRef, {
        ...JSON.parse(JSON.stringify(patient)),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      console.warn('[UnifiedFirebase] Save patient error:', error);
      return false;
    }
  }

  /** Delete Patient from Firestore */
  public static async deletePatient(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'patients', id));
      return true;
    } catch (error) {
      console.warn('[UnifiedFirebase] Delete patient error:', error);
      return false;
    }
  }

  /** Save or update Health Card in Firestore */
  public static async saveCard(card: HealthCard): Promise<boolean> {
    try {
      const docRef = doc(db, 'cards', card.id);
      await setDoc(docRef, {
        ...JSON.parse(JSON.stringify(card)),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      console.warn('[UnifiedFirebase] Save card error:', error);
      return false;
    }
  }

  /** Delete Health Card from Firestore */
  public static async deleteCard(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'cards', id));
      return true;
    } catch (error) {
      console.warn('[UnifiedFirebase] Delete card error:', error);
      return false;
    }
  }

  /** Save or update Appointment in Firestore */
  public static async saveAppointment(appointment: PatientAppointment): Promise<boolean> {
    try {
      const docRef = doc(db, 'appointments', appointment.id);
      await setDoc(docRef, {
        ...JSON.parse(JSON.stringify(appointment)),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      console.warn('[UnifiedFirebase] Save appointment error:', error);
      return false;
    }
  }

  /** Delete Appointment from Firestore */
  public static async deleteAppointment(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'appointments', id));
      return true;
    } catch (error) {
      console.warn('[UnifiedFirebase] Delete appointment error:', error);
      return false;
    }
  }
}
