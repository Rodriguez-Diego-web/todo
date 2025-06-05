import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User } from '../types';

export class UserService {
  // Benutzer Profil aktualisieren
  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, profileData);
  }
}

export const userService = new UserService(); 