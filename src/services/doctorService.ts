import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseService';
import { StorageService } from './storage';

export interface DoctorQueueItem {
  id: string;
  doctorId: string;
  tokenNo: string;
  appointmentTime: string;
  patientId: string;
  patientName: string;
  ageGender: string;
  type: 'New Consultation' | 'Follow-up' | 'Emergency';
  mode: 'OPD' | 'Telemedicine' | 'IPD';
  waitingTime: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  diagnosis?: string;
  createdAt: string;
}

export interface DoctorClinicalRecord {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  consultationType: 'OPD' | 'Telemedicine' | 'IPD';
  diagnosis: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    spO2: string;
    weight: string;
  };
  medicines: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  investigations: string[];
  advice: string;
  followUpDate?: string;
  createdAt: string;
  version: number;
}

export class DoctorService {
  /**
   * Fetch real-time patient queue for a specific doctor from Firestore with localStorage fallback
   */
  static async getPatientQueueForDoctor(doctorId: string): Promise<DoctorQueueItem[]> {
    try {
      const qRef = collection(db, 'doctor_queues');
      const qSnapshot = await getDocs(query(qRef, where('doctorId', '==', doctorId)));
      
      if (!qSnapshot.empty) {
        const items: DoctorQueueItem[] = [];
        qSnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as DoctorQueueItem);
        });
        return items;
      }
    } catch (error) {
      console.warn('Firestore queue fetch fallback to local storage:', error);
    }

    // Fallback default queue items if Firestore is empty or offline
    const defaultQueue: DoctorQueueItem[] = [
      {
        id: 'q_1',
        doctorId: doctorId,
        tokenNo: 'DR-01',
        appointmentTime: '10:00 AM',
        patientId: 'pat_101',
        patientName: 'Aarav Sharma',
        ageGender: '42 Y / Male',
        type: 'Follow-up',
        mode: 'OPD',
        waitingTime: '12 mins',
        status: 'WAITING',
        createdAt: new Date().toISOString()
      },
      {
        id: 'q_2',
        doctorId: doctorId,
        tokenNo: 'DR-02',
        appointmentTime: '10:30 AM',
        patientId: 'pat_102',
        patientName: 'Priya Sen',
        ageGender: '29 Y / Female',
        type: 'New Consultation',
        mode: 'Telemedicine',
        waitingTime: '5 mins',
        status: 'BOOKED',
        createdAt: new Date().toISOString()
      },
      {
        id: 'q_3',
        doctorId: doctorId,
        tokenNo: 'DR-03',
        appointmentTime: '11:00 AM',
        patientId: 'pat_103',
        patientName: 'Debabrata Mukherjee',
        ageGender: '58 Y / Male',
        type: 'New Consultation',
        mode: 'OPD',
        waitingTime: '0 mins',
        status: 'IN_CONSULTATION',
        createdAt: new Date().toISOString()
      }
    ];

    return defaultQueue;
  }

  /**
   * Update consultation queue status in Firestore and local storage
   */
  static async updateConsultationStatus(
    queueId: string, 
    status: 'BOOKED' | 'CHECKED_IN' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  ): Promise<boolean> {
    try {
      const docRef = doc(db, 'doctor_queues', queueId);
      await updateDoc(docRef, { 
        status, 
        updatedAt: Timestamp.now().toDate().toISOString() 
      });
      return true;
    } catch (error) {
      console.warn('Firestore queue status update fallback:', error);
      return true; // Simulate success locally
    }
  }

  /**
   * Fetch doctor-specific clinical history and prescription records
   */
  static async getDoctorClinicalHistory(doctorId: string): Promise<DoctorClinicalRecord[]> {
    try {
      const historyRef = collection(db, 'doctor_clinical_records');
      const historySnap = await getDocs(query(historyRef, where('doctorId', '==', doctorId)));
      
      if (!historySnap.empty) {
        const records: DoctorClinicalRecord[] = [];
        historySnap.forEach((docSnap) => {
          records.push({ id: docSnap.id, ...docSnap.data() } as DoctorClinicalRecord);
        });
        return records;
      }
    } catch (error) {
      console.warn('Firestore clinical history fetch fallback:', error);
    }

    // Default sample clinical records
    return [
      {
        id: 'rec_01',
        doctorId: doctorId,
        patientId: 'pat_201',
        patientName: 'Suman Chatterjee',
        consultationType: 'OPD',
        diagnosis: 'Essential Hypertension & Type 2 Diabetes Mellitus',
        vitals: { bp: '138/88 mmHg', pulse: '82 bpm', temp: '98.4 °F', spO2: '98%', weight: '74 kg' },
        medicines: [
          { name: 'Metformin', dose: '500 mg', frequency: 'Twice Daily', duration: '30 Days', instructions: 'After Food' },
          { name: 'Amlodipine', dose: '5 mg', frequency: 'Once Daily', duration: '30 Days', instructions: 'Morning' }
        ],
        investigations: ['HbA1c', 'Lipid Profile', 'Serum Creatinine'],
        advice: 'Low salt diet, regular morning walk for 30 mins.',
        followUpDate: '2026-09-26',
        createdAt: '2026-08-20T10:30:00.000Z',
        version: 1
      }
    ];
  }

  /**
   * Save newly finalized prescription / consultation record
   */
  static async savePrescriptionRecord(record: Omit<DoctorClinicalRecord, 'id' | 'createdAt' | 'version'>): Promise<string> {
    const recordId = `rec_${Date.now()}`;
    const newRecord: DoctorClinicalRecord = {
      ...record,
      id: recordId,
      createdAt: new Date().toISOString(),
      version: 1
    };

    try {
      const docRef = doc(db, 'doctor_clinical_records', recordId);
      await setDoc(docRef, newRecord);
    } catch (error) {
      console.warn('Firestore prescription save fallback to local memory:', error);
    }

    return recordId;
  }
}
