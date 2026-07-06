import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { User, WithdrawalRequest, DiamondPurchase } from '../types';

// Firebase Config directly using the real production credentials
const firebaseConfig = {
  apiKey: "AIzaSyA6O367X5Onc9MgFAECcPofaliGvvxnwGI",
  authDomain: "divine-rainfall-t8gvj.firebaseapp.com",
  projectId: "divine-rainfall-t8gvj",
  storageBucket: "divine-rainfall-t8gvj.firebasestorage.app",
  messagingSenderId: "112415432282",
  appId: "1:112415432282:web:69ed2e6e82760aef8b0263"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if provided
export const db = getFirestore(app, "ai-studio-sheikcoin-cd779c35-87e4-44ef-839d-f79c518bf93b");

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Searches for a user by email in the Firestore 'users' collection
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const path = 'users';
  try {
    const usersRef = collection(db, path);
    const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      name: docData.name,
      email: docData.email,
      password: docData.password,
      pixKey: docData.pixKey || '',
      coins: typeof docData.coinsApproved === 'number' ? docData.coinsApproved : (typeof docData.coins === 'number' ? docData.coins : 0),
      createdAt: docData.createdAt || ''
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Gets a user by their unique ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const path = 'users';
  try {
    const userDocRef = doc(db, path, userId);
    const docSnap = await getDoc(userDocRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const docData = docSnap.data();
    return {
      id: docSnap.id,
      name: docData.name,
      email: docData.email,
      password: docData.password,
      pixKey: docData.pixKey || '',
      coins: typeof docData.coinsApproved === 'number' ? docData.coinsApproved : (typeof docData.coins === 'number' ? docData.coins : 0),
      createdAt: docData.createdAt || ''
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Creates or overwrites a user record in Firestore
 */
export async function saveUser(user: User): Promise<void> {
  const path = 'users';
  try {
    const userDocRef = doc(db, path, user.id);
    await setDoc(userDocRef, {
      name: user.name,
      email: user.email.toLowerCase().trim(),
      password: user.password || '',
      pixKey: user.pixKey || '',
      coinsApproved: user.coins,
      coins: user.coins,
      createdAt: user.createdAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates a user's coin balance
 */
export async function updateUserCoins(userId: string, coins: number): Promise<void> {
  const path = 'users';
  try {
    const userDocRef = doc(db, path, userId);
    await updateDoc(userDocRef, {
      coinsApproved: coins,
      coins: coins
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Updates a user's Pix Key
 */
export async function updateUserPixKey(userId: string, pixKey: string): Promise<void> {
  const path = 'users';
  try {
    const userDocRef = doc(db, path, userId);
    await updateDoc(userDocRef, { pixKey });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Adds a new withdrawal request to Firestore
 */
export async function saveWithdrawalRequest(request: WithdrawalRequest): Promise<void> {
  const path = 'withdrawals';
  try {
    const requestDocRef = doc(db, path, request.id);
    await setDoc(requestDocRef, {
      id: request.id,
      userId: request.userId,
      date: request.date,
      coins: request.coins,
      valueBRL: request.valueBRL,
      status: request.status,
      pixKey: request.pixKey
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves all withdrawal requests for a specific user from Firestore
 */
export async function getWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  const path = 'withdrawals';
  try {
    const withdrawalsRef = collection(db, path);
    const q = query(withdrawalsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const requests: WithdrawalRequest[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      requests.push({
        id: data.id,
        userId: data.userId,
        date: data.date,
        coins: typeof data.coins === 'number' ? data.coins : 0,
        valueBRL: typeof data.valueBRL === 'number' ? data.valueBRL : 0,
        status: data.status || 'Pendente',
        pixKey: data.pixKey || ''
      });
    });
    
    // Sort manually by date descending if sorting isn't pre-indexed
    return requests.sort((a, b) => {
      const partsA = a.date.split('/');
      const partsB = b.date.split('/');
      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0])).getTime();
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0])).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Retrieves all users from Firestore (Admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const path = 'users';
  try {
    const usersRef = collection(db, path);
    const querySnapshot = await getDocs(usersRef);
    
    const usersList: User[] = [];
    querySnapshot.forEach((docSnap) => {
      const docData = docSnap.data();
      usersList.push({
        id: docSnap.id,
        name: docData.name,
        email: docData.email,
        password: docData.password,
        pixKey: docData.pixKey || '',
        coins: typeof docData.coinsApproved === 'number' ? docData.coinsApproved : (typeof docData.coins === 'number' ? docData.coins : 0),
        createdAt: docData.createdAt || ''
      });
    });
    
    return usersList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Retrieves all withdrawal requests from Firestore (Admin only)
 */
export async function getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  const path = 'withdrawals';
  try {
    const withdrawalsRef = collection(db, path);
    const querySnapshot = await getDocs(withdrawalsRef);
    
    const requests: WithdrawalRequest[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      requests.push({
        id: data.id,
        userId: data.userId,
        date: data.date,
        coins: typeof data.coins === 'number' ? data.coins : 0,
        valueBRL: typeof data.valueBRL === 'number' ? data.valueBRL : 0,
        status: data.status || 'Pendente',
        pixKey: data.pixKey || ''
      });
    });
    
    // Sort manually by date descending
    return requests.sort((a, b) => {
      const partsA = a.date.split('/');
      const partsB = b.date.split('/');
      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0])).getTime();
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0])).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Updates a withdrawal request status and optionally refunds the user's coins if rejected
 */
export async function updateWithdrawalStatusAndRefund(
  withdrawalId: string, 
  status: 'Pendente' | 'Processando' | 'Aprovado' | 'Recusado', 
  userId: string, 
  coinsToRefund: number
): Promise<void> {
  const withdrawalsPath = 'withdrawals';
  const usersPath = 'users';
  try {
    // 1. Update withdrawal request status
    const requestDocRef = doc(db, withdrawalsPath, withdrawalId);
    await updateDoc(requestDocRef, { status });
    
    // 2. If status is 'Recusado' (or similar refund trigger), return coins to user balance
    if (status === 'Recusado' && coinsToRefund > 0) {
      const userDocRef = doc(db, usersPath, userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const currentCoins = userSnap.data().coins || 0;
        const newCoins = currentCoins + coinsToRefund;
        await updateDoc(userDocRef, { coins: newCoins });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, withdrawalsPath);
  }
}

// ==========================================
// FREE FIRE DIAMONDS STORE FIRESTORE SERVICES
// ==========================================

/**
 * Saves a new diamond purchase to the 'transactions' collection
 */
export async function saveDiamondPurchase(purchase: DiamondPurchase): Promise<void> {
  const path = 'transactions';
  try {
    const purchaseDocRef = doc(db, path, purchase.id);
    await setDoc(purchaseDocRef, {
      id_usuario: purchase.userId,
      quantidade_dimas: purchase.diamonds,
      id_jogador_ff: purchase.playerFFId,
      coinsCost: purchase.coinsCost,
      status: purchase.status,
      data: purchase.date
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieves all diamond purchases for a specific user from Firestore
 */
export async function getDiamondPurchases(userId: string): Promise<DiamondPurchase[]> {
  const path = 'transactions';
  try {
    const purchasesRef = collection(db, path);
    const q = query(purchasesRef, where('id_usuario', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const list: DiamondPurchase[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.id_usuario || '',
        diamonds: typeof data.quantidade_dimas === 'number' ? data.quantidade_dimas : 0,
        playerFFId: data.id_jogador_ff || '',
        coinsCost: typeof data.coinsCost === 'number' ? data.coinsCost : 0,
        status: data.status || 'Pendente',
        date: data.data || ''
      });
    });
    
    // Sort manually by date descending
    return list.sort((a, b) => {
      const partsA = a.date.split('/');
      const partsB = b.date.split('/');
      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0])).getTime();
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0])).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Retrieves all diamond purchases from Firestore (Admin only)
 */
export async function getAllDiamondPurchases(): Promise<DiamondPurchase[]> {
  const path = 'transactions';
  try {
    const purchasesRef = collection(db, path);
    const querySnapshot = await getDocs(purchasesRef);
    
    const list: DiamondPurchase[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.id_usuario || '',
        diamonds: typeof data.quantidade_dimas === 'number' ? data.quantidade_dimas : 0,
        playerFFId: data.id_jogador_ff || '',
        coinsCost: typeof data.coinsCost === 'number' ? data.coinsCost : 0,
        status: data.status || 'Pendente',
        date: data.data || ''
      });
    });
    
    // Sort manually by date descending
    return list.sort((a, b) => {
      const partsA = a.date.split('/');
      const partsB = b.date.split('/');
      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0])).getTime();
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0])).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Updates a purchase status and optionally refunds the user's coins if rejected
 */
export async function updatePurchaseStatusAndRefund(
  purchaseId: string,
  status: 'Pendente' | 'Aprovado' | 'Recusado',
  userId: string,
  coinsToRefund: number
): Promise<void> {
  const purchasesPath = 'transactions';
  const usersPath = 'users';
  try {
    // 1. Update status
    const purchaseDocRef = doc(db, purchasesPath, purchaseId);
    await updateDoc(purchaseDocRef, { status });
    
    // 2. Refund if refused
    if (status === 'Recusado' && coinsToRefund > 0) {
      const userDocRef = doc(db, usersPath, userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const docData = userSnap.data();
        const currentCoins = docData.coinsApproved || docData.coins || 0;
        const newCoins = currentCoins + coinsToRefund;
        await updateDoc(userDocRef, { 
          coinsApproved: newCoins,
          coins: newCoins
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, purchasesPath);
  }
}
