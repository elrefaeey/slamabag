import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface HeroImage {
  id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHeroImage {
  imageUrl: string;
  order: number;
  isActive: boolean;
}

const COLLECTION_NAME = 'heroImages';

// Convert Firestore document to HeroImage
const convertToHeroImage = (doc: any): HeroImage => {
  const data = doc.data();
  return {
    id: doc.id,
    imageUrl: data.imageUrl,
    order: data.order || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Get all hero images
export const getAllHeroImages = async (): Promise<HeroImage[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToHeroImage);
  } catch (error) {
    console.error('Error getting hero images:', error);
    throw error;
  }
};

// Get active hero images only
export const getActiveHeroImages = async (): Promise<HeroImage[]> => {
  try {
    const allImages = await getAllHeroImages();
    return allImages.filter((img) => img.isActive);
  } catch (error) {
    console.error('Error getting active hero images:', error);
    throw error;
  }
};

// Add new hero image
export const addHeroImage = async (heroImageData: CreateHeroImage): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...heroImageData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding hero image:', error);
    throw error;
  }
};

// Update hero image
export const updateHeroImage = async (
  id: string,
  heroImageData: Partial<CreateHeroImage>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...heroImageData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating hero image:', error);
    throw error;
  }
};

// Delete hero image
export const deleteHeroImage = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting hero image:', error);
    throw error;
  }
};

// Subscribe to hero images changes
export const subscribeToHeroImages = (
  callback: (heroImages: HeroImage[]) => void
): (() => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const heroImages = snapshot.docs.map(convertToHeroImage);
      callback(heroImages);
    },
    (error) => {
      console.error('Error subscribing to hero images:', error);
    }
  );
};

// Subscribe to active hero images only
export const subscribeToActiveHeroImages = (
  callback: (heroImages: HeroImage[]) => void
): (() => void) => {
  return subscribeToHeroImages((allImages) => {
    const activeImages = allImages.filter((img) => img.isActive);
    callback(activeImages);
  });
};

