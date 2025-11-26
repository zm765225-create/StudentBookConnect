import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, get } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Fallback values - will use environment variables if available
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB_pHajHXy5PkqSGMHNOoA6HU5omPOsSY4',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'database-of-books.firebaseapp.com',
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || 'https://database-of-books.firebaseio.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'database-of-books',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'database-of-books.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '716778116166',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:716778116166:web:599e33506ae70708412647',
};

let app: any;
let database: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  // Silent error handling
}

export { database, auth };
export const googleProvider = new GoogleAuthProvider();

// Student Data Functions
export const saveStudentToFirebase = async (studentId: string, studentData: any) => {
  try {
    if (!database) return;
    const studentRef = ref(database, `students/${studentId}`);
    await set(studentRef, {
      ...studentData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    // Silent error handling
  }
};

export const getStudentFromFirebase = async (studentId: string) => {
  try {
    if (!database) return null;
    const studentRef = ref(database, `students/${studentId}`);
    const snapshot = await get(studentRef);
    return snapshot.val();
  } catch (error) {
    return null;
  }
};

export const subscribeToStudents = (callback: (students: Record<string, any>) => void) => {
  try {
    if (!database) return;
    const studentsRef = ref(database, 'students');
    return onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  } catch (error) {
    // Silent error handling
  }
};

export const deleteStudentFromFirebase = async (studentId: string) => {
  try {
    if (!database) return;
    const studentRef = ref(database, `students/${studentId}`);
    await remove(studentRef);
  } catch (error) {
    // Silent error handling
  }
};

// Products Functions
export const saveProductToFirebase = async (productId: string, productData: any) => {
  try {
    if (!database) return;
    const productRef = ref(database, `products/${productId}`);
    await set(productRef, {
      ...productData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    // Silent error handling
  }
};

export const subscribeToProducts = (callback: (products: Record<string, any>) => void) => {
  try {
    if (!database) return;
    const productsRef = ref(database, 'products');
    return onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  } catch (error) {
    // Silent error handling
  }
};

export const deleteProductFromFirebase = async (productId: string) => {
  try {
    if (!database) return;
    const productRef = ref(database, `products/${productId}`);
    await remove(productRef);
  } catch (error) {
    // Silent error handling
  }
};

// Google Auth
export const signInWithGoogle = async () => {
  try {
    if (!auth) throw new Error('Authentication not available');
    const result = await signInWithPopup(auth, googleProvider);
    return {
      user: result.user,
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
    };
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    if (!auth) return;
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Logs Functions
export const saveLogToFirebase = async (logData: any) => {
  try {
    if (!database) return;
    const timestamp = new Date().toISOString();
    const logsRef = ref(database, `logs/${timestamp}`);
    await set(logsRef, logData);
  } catch (error) {
    // Silent error handling
  }
};

export const subscribeToLogs = (callback: (logs: Record<string, any>) => void) => {
  try {
    if (!database) return;
    const logsRef = ref(database, 'logs');
    return onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  } catch (error) {
    // Silent error handling
  }
};

export default app;
