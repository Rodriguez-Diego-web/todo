import { useState, useEffect } from 'react';
import type { List } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLists([]);
      setLoading(false);
      return;
    }

    // Subscribe to real-time updates
    const unsubscribe = firestoreService.subscribeToUserLists(
      currentUser.uid,
      (updatedLists) => {
        setLists(updatedLists);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

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

  const refetch = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userLists = await firestoreService.getUserLists(currentUser.uid);
      const sharedLists = await firestoreService.getSharedLists(currentUser.uid);
      setLists([...userLists, ...sharedLists]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

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
