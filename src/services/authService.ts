import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import type { User } from '../types';

export class AuthService {
  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore
    const user: User = {
      id: firebaseUser.uid,
      name: displayName,
      email: email,
      initials: this.getInitials(displayName),
      avatar: firebaseUser.photoURL || undefined
    };

    await this.createUserDocument(user);
    return user;
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;

    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown User',
        email: firebaseUser.email || '',
        initials: this.getInitials(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown User'),
        avatar: firebaseUser.photoURL || undefined
      };
      await this.createUserDocument(user);
      return user;
    }

    return userDoc.data() as User;
  }

  // Sign out
  async signOut(): Promise<void> {
    return signOut(auth);
  }

  // Create user document in Firestore
  async createUserDocument(user: User): Promise<void> {
    await setDoc(doc(db, 'users', user.id), user);
  }

  // Get user document from Firestore
  async getUserDocument(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() as User : null;
  }

  // Get initials from name
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }
}

export const authService = new AuthService(); 