import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Task, List, Invitation } from '../types';

export class FirestoreService {
  // ============ LISTS ============
  
  // Get all lists for a user
  async getUserLists(userId: string): Promise<List[]> {
    const q = query(
      collection(db, 'lists'),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as List));
  }

  // Get shared lists for a user
  async getSharedLists(userId: string): Promise<List[]> {
    const q = query(
      collection(db, 'lists'),
      where('sharedWith', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as List));
  }

  // Create a new list
  async createList(list: Omit<List, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'lists'), {
      ...list,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      sharedWith: list.sharedWith || []
    });
    return docRef.id;
  }

  // Update a list
  async updateList(listId: string, updates: Partial<Omit<List, 'id' | 'createdAt'>>): Promise<void> {
    // Filter out undefined values that Firestore doesn't allow
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    
    await updateDoc(doc(db, 'lists', listId), {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  }

  // Delete a list and all its tasks
  async deleteList(listId: string): Promise<void> {
    // Delete all tasks in the list first
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('listId', '==', listId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    
    const deletePromises = tasksSnapshot.docs.map(taskDoc => 
      deleteDoc(doc(db, 'tasks', taskDoc.id))
    );
    
    await Promise.all(deletePromises);
    
    // Delete the list
    await deleteDoc(doc(db, 'lists', listId));
  }

  // Listen to user's lists in real-time
  subscribeToUserLists(userId: string, callback: (lists: List[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'lists'),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as List));
      callback(lists);
    });
  }

  // Listen to shared lists in real-time
  subscribeToSharedLists(userId: string, callback: (lists: List[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'lists'),
      where('sharedWith', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as List));
      callback(lists);
    });
  }

  // ============ TASKS ============
  
  // Get all tasks for a list
  async getListTasks(listId: string): Promise<Task[]> {
    const q = query(
      collection(db, 'tasks'),
      where('listId', '==', listId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
  }

  // Get tasks due today for a user
  async getTodayTasks(userId: string): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'tasks'),
      where('createdBy', '==', userId),
      where('dueDate', '>=', today),
      where('dueDate', '<', today + 'T23:59:59.999Z'),
      where('completed', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
  }

  // Create a new task
  async createTask(task: Omit<Task, 'id' | 'updatedAt'>): Promise<string> {
    // Filter out undefined values that Firestore doesn't allow
    const cleanTask = Object.fromEntries(
      Object.entries(task).filter(([, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...cleanTask,
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  // Update a task
  async updateTask(taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<void> {
    // Filter out undefined values that Firestore doesn't allow
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    
    await updateDoc(doc(db, 'tasks', taskId), {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', taskId));
  }

  // Listen to list tasks in real-time
  subscribeToListTasks(listId: string, callback: (tasks: Task[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'tasks'),
      where('listId', '==', listId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
      callback(tasks);
    });
  }

  // ============ INVITATIONS ============
  
  // Create an invitation
  async createInvitation(invitation: Omit<Invitation, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'invitations'), {
      ...invitation,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  // Get pending invitations for an email
  async getPendingInvitations(email: string): Promise<Invitation[]> {
    const q = query(
      collection(db, 'invitations'),
      where('inviteeEmail', '==', email),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invitation));
  }

  // Update invitation status
  async updateInvitationStatus(invitationId: string, status: 'accepted' | 'rejected'): Promise<void> {
    await updateDoc(doc(db, 'invitations', invitationId), { status });
  }

  // ============ LIST PERMISSIONS ============
  
  // Add user to list's shared users
  async shareList(listId: string, userId: string, role: 'editor' | 'viewer' = 'editor'): Promise<void> {
    // Add user to list's sharedWith array
    const listRef = doc(db, 'lists', listId);
    const listDoc = await getDoc(listRef);
    
    if (listDoc.exists()) {
      const listData = listDoc.data() as List;
      const sharedWith = listData.sharedWith || [];
      
      if (!sharedWith.includes(userId)) {
        await updateDoc(listRef, {
          sharedWith: [...sharedWith, userId],
          updatedAt: serverTimestamp()
        });
      }
    }

    // Create permission document
    await addDoc(collection(db, 'listPermissions'), {
      listId,
      userId,
      role,
      grantedAt: serverTimestamp()
    });
  }

  // Check if user has access to list
  async hasListAccess(listId: string, userId: string): Promise<boolean> {
    // Check if user is the owner
    const listDoc = await getDoc(doc(db, 'lists', listId));
    if (listDoc.exists()) {
      const listData = listDoc.data() as List;
      if (listData.createdBy === userId) return true;
      if (listData.sharedWith?.includes(userId)) return true;
    }
    
    return false;
  }
}

export const firestoreService = new FirestoreService(); 