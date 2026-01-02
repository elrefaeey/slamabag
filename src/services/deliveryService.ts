import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DeliveryArea {
  id: string;
  name: string;
  // price can be null initially (not set)
  price: number | null;
  createdAt?: any;
  updatedAt?: any;
}

export type CreateDeliveryArea = Omit<DeliveryArea, 'id' | 'createdAt' | 'updatedAt'>;

const DELIVERY_COLLECTION = 'deliveryAreas';

export const getAllDeliveryAreas = async (): Promise<DeliveryArea[]> => {
  const areasRef = collection(db, DELIVERY_COLLECTION);
  const q = query(areasRef, orderBy('name'));
  const snapshot = await getDocs(q);
  const areas: DeliveryArea[] = [];
  snapshot.forEach((d) => {
    const data = d.data() as any;
    areas.push({
      id: d.id,
      name: data.name,
      price: data.price ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });
  return areas;
};

export const addDeliveryArea = async (area: CreateDeliveryArea): Promise<string> => {
  const areasRef = collection(db, DELIVERY_COLLECTION);
  const docRef = await addDoc(areasRef, {
    ...area,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateDeliveryArea = async (id: string, update: Partial<CreateDeliveryArea>) => {
  const ref = doc(db, DELIVERY_COLLECTION, id);
  await updateDoc(ref, { ...update, updatedAt: Timestamp.now() });
};

export const deleteDeliveryArea = async (id: string) => {
  const ref = doc(db, DELIVERY_COLLECTION, id);
  await deleteDoc(ref);
};

export const subscribeToDeliveryAreas = (cb: (areas: DeliveryArea[]) => void) => {
  const areasRef = collection(db, DELIVERY_COLLECTION);
  const q = query(areasRef, orderBy('name'));
  return onSnapshot(q, (snap) => {
    const areas: DeliveryArea[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      areas.push({
        id: d.id,
        name: data.name,
        price: data.price ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    cb(areas);
  }, (err) => console.error('Error listening to delivery areas:', err));
};