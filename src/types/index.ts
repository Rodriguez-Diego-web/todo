import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;            // UUID
  listId: string;
  title: string;
  notes?: string;
  dueDate?: string;      // ISO 8601
  priority: 0 | 1 | 2;   // 0=Low,1=Medium,2=High
  completed: boolean;
  updatedAt: string | Timestamp; // Firebase serverTimestamp
  assignedTo?: string; // User ID
  createdBy: string; // User ID
  order?: number; // For drag and drop ordering
}

export interface List {
  id: string;            // UUID
  name: string;
  createdAt: string | Timestamp; // Firebase serverTimestamp
  updatedAt: string | Timestamp; // Firebase serverTimestamp
  createdBy: string; // User ID
  sharedWith: string[]; // Array of user IDs - not optional anymore
  color?: string; // For list color themes
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string; // For display in UI
}

export interface Invitation {
  id: string;
  listId: string;
  inviterUserId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string | Timestamp; // Firebase serverTimestamp
}

export interface ListPermission {
  listId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: string | Timestamp; // Firebase serverTimestamp
}
