import { useState, useEffect, useCallback } from 'react';
import type { Invitation, List } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const loadInvitations = useCallback(async () => {
    if (!currentUser?.email) return;
    
    try {
      setLoading(true);
      const pendingInvitations = await firestoreService.getPendingInvitations(currentUser.email);
      setInvitations(pendingInvitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, [currentUser, setLoading, setInvitations, setError]);

  useEffect(() => {
    if (!currentUser?.email) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    loadInvitations();
  }, [currentUser, loadInvitations]);

  const acceptInvitation = async (invitationId: string, listId: string) => {
    if (!currentUser) throw new Error('Benutzer muss angemeldet sein, um eine Einladung anzunehmen');
    
    try {
      setLoading(true);
      
      // Aktualisiere den Einladungsstatus auf 'accepted'
      await firestoreService.updateInvitationStatus(invitationId, 'accepted');
      
      // Füge den Benutzer zur Liste direkt über Firestore-Service hinzu
      const listRef = doc(db, 'lists', listId);
      const listDoc = await getDoc(listRef);
      
      if (listDoc.exists()) {
        const listData = listDoc.data() as List;
        const sharedWith = listData.sharedWith || [];
        
        // Prüfen, ob der Benutzer bereits in der Liste ist
        if (!sharedWith.includes(currentUser.uid)) {
          await updateDoc(listRef, {
            sharedWith: [...sharedWith, currentUser.uid],
            updatedAt: serverTimestamp()
          });
        }
      }
      
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Fehler beim Annehmen der Einladung:', error);
      setError(error instanceof Error ? error.message : 'Fehler beim Annehmen der Einladung');
    } finally {
      setLoading(false);
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      // Update invitation status
      await firestoreService.updateInvitationStatus(invitationId, 'rejected');
      
      // Remove from pending invitations
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject invitation');
      throw err;
    }
  };

  return {
    invitations,
    loading,
    error,
    acceptInvitation,
    rejectInvitation,
    refetch: loadInvitations,
  };
} 