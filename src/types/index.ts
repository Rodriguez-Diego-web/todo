import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;            // UUID
  listId: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  priority: 0 | 1 | 2;   // 0=Low,1=Medium,2=High
  completed: boolean;
  updatedAt: Date | string;
  createdAt: Date | string;
  createdBy: string; // User ID
  order?: number; // For drag and drop ordering
}

export interface List {
  id: string;            // UUID
  name: string;
  color: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;     // ID des Erstellers
  sharedWith?: {
    userId: string;
    role: 'editor' | 'viewer';
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
  createdAt: Date | string;
  lastLogin?: Date | string;
  notificationsEnabled?: boolean;
  notificationSettings?: {
    taskReminders: boolean;
    invitations: boolean;
    listUpdates: boolean;
    updatedAt: Date | string;
  };
}

export interface Invitation {
  id: string;
  listId: string;
  inviterUserId: string;
  inviteeEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date | string;
}

export interface ListPermission {
  listId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  grantedAt: string | Timestamp; // Firebase serverTimestamp
}
