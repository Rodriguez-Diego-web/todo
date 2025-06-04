import { useState, useEffect, useCallback } from 'react';
import type { List } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const loadAllLists = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const [userLists, sharedLists] = await Promise.all([
        firestoreService.getUserLists(currentUser.uid),
        firestoreService.getSharedLists(currentUser.uid)
      ]);
      
      // Combine and deduplicate lists
      const allLists = [...userLists, ...sharedLists];
      const uniqueLists = allLists.filter((list, index, self) => 
        index === self.findIndex(l => l.id === list.id)
      );
      
      setLists(uniqueLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setLists([]);
      setLoading(false);
      return;
    }

    // Load both owned and shared lists
    loadAllLists();
    
    // Subscribe to real-time updates for owned lists
    const unsubscribeOwned = firestoreService.subscribeToUserLists(
      currentUser.uid,
      () => {
        loadAllLists(); // Reload all lists when owned lists change
      }
    );

    // Subscribe to real-time updates for shared lists
    const unsubscribeShared = firestoreService.subscribeToSharedLists(
      currentUser.uid,
      () => {
        loadAllLists(); // Reload all lists when shared lists change
      }
    );

    return () => {
      unsubscribeOwned();
      unsubscribeShared();
    };
  }, [currentUser, loadAllLists]);

  const createList = async (name: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      const newListData: Omit<List, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        createdBy: currentUser.uid,
        sharedWith: [],
      };
      
      const listId = await firestoreService.createList(newListData);
      
      // The real-time listener will update the state automatically
      return { id: listId, ...newListData };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
      throw err;
    }
  };

  const updateList = async (id: string, name: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      await firestoreService.updateList(id, { name });
      // The real-time listener will update the state automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list');
      throw err;
    }
  };

  const deleteList = async (id: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      await firestoreService.deleteList(id);
      // The real-time listener will update the state automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      throw err;
    }
  };

  const refetch = loadAllLists;

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    refetch,
  };
}
