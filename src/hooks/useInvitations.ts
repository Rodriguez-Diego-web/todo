import { useState, useEffect } from 'react';
import type { Invitation } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.email) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    loadInvitations();
  }, [currentUser]);

  const loadInvitations = async () => {
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
  };

  const acceptInvitation = async (invitationId: string, listId: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      // Update invitation status
      await firestoreService.updateInvitationStatus(invitationId, 'accepted');
      
      // Add user to list
      await firestoreService.shareList(listId, currentUser.uid, 'editor');
      
      // Remove from pending invitations
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      throw err;
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