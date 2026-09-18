import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDocFromServer,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Listing, User, ItemStatus } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId required by the platform
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test initial connection as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Firestore will use offline persistence cache.');
    }
    return false;
  }
}

// Trigger connection test non-blockingly
testConnection().catch(() => {});

// Firestore Error Logger and Handler as required by Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return new Error(errInfo.error);
}

// ----------------------------------------------------
// REAL-TIME LISTINGS REPOSITORY (FIRESTORE)
// ----------------------------------------------------

/**
 * Subscribe in real time to all marketplace listings from Firestore.
 * Callback is triggered whenever any user creates, edits, or deletes a listing.
 */
export function subscribeToListings(
  onUpdate: (listings: Listing[]) => void,
  onError?: (err: Error) => void
): () => void {
  const listingsCol = collection(db, 'listings');
  const q = query(listingsCol, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          price: typeof data.price === 'number' ? data.price : 0,
          categoryId: data.categoryId || 'otros',
          condition: data.condition || 'Usado',
          images: Array.isArray(data.images) ? data.images : [],
          phone: data.phone || '',
          whatsapp: data.whatsapp || data.phone || '',
          province: data.province || 'Hato Mayor',
          municipality: data.municipality || 'Hato Mayor del Rey',
          sector: data.sector || 'Centro de Hato Mayor',
          meetingPlaceType: data.meetingPlaceType || 'public',
          meetingPlaceDetails: data.meetingPlaceDetails || '',
          status: (data.status as ItemStatus) || 'Disponible',
          sellerId: data.sellerId || 'unknown',
          sellerName: data.sellerName || 'Vendedor',
          sellerAvatar: data.sellerAvatar,
          sellerJoinedDate: data.sellerJoinedDate || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
          views: typeof data.views === 'number' ? data.views : 0,
          isFeatured: Boolean(data.isFeatured),
          isApproved: data.isApproved !== false,
          updatedAt: data.updatedAt,
          sellerRole: data.sellerRole || 'seller',
        });
      });
      onUpdate(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'listings');
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a listing document in Firestore
 */
export async function saveListingToFirestore(listing: Listing): Promise<void> {
  const docRef = doc(db, 'listings', listing.id);
  const data = {
    ...listing,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, `listings/${listing.id}`);
  }
}

/**
 * Delete a listing from Firestore
 */
export async function deleteListingFromFirestore(listingId: string): Promise<void> {
  const docRef = doc(db, 'listings', listingId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    throw handleFirestoreError(err, OperationType.DELETE, `listings/${listingId}`);
  }
}

/**
 * Change listing status in Firestore
 */
export async function updateListingStatusInFirestore(listingId: string, status: ItemStatus): Promise<void> {
  const docRef = doc(db, 'listings', listingId);
  try {
    await setDoc(docRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.UPDATE, `listings/${listingId}`);
  }
}

// ----------------------------------------------------
// USERS REPOSITORY (FIRESTORE)
// ----------------------------------------------------

/**
 * Save user profile in Firestore
 */
export async function saveUserToFirestore(user: User): Promise<void> {
  const docRef = doc(db, 'users', user.id);
  try {
    await setDoc(docRef, user, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
  }
}

/**
 * Fetch a user from Firestore by ID
 */
export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    return null;
  }
}
