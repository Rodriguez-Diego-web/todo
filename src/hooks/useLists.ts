import { useState, useEffect } from 'react';
import type { List } from '../types';
import * as db from '../db';
import { v4 as uuidv4 } from 'uuid';

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const allLists = await db.getAllLists();
      setLists(allLists);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const createList = async (name: string) => {
    try {
      const newList: List = {
        id: uuidv4(),
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.createList(newList);
      setLists([...lists, newList]);
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
      throw err;
    }
  };

  const updateList = async (id: string, name: string) => {
    try {
      const list = lists.find(l => l.id === id);
      if (!list) throw new Error('List not found');
      
      const updatedList: List = {
        ...list,
        name,
        updatedAt: new Date().toISOString(),
      };
      await db.updateList(updatedList);
      setLists(lists.map(l => l.id === id ? updatedList : l));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list');
      throw err;
    }
  };

  const deleteList = async (id: string) => {
    try {
      await db.deleteList(id);
      setLists(lists.filter(l => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      throw err;
    }
  };

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    refetch: loadLists,
  };
}
