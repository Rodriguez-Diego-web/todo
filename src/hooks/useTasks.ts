import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

export function useTasks(listId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (listId) {
      // Subscribe to tasks for specific list
      const unsubscribe = firestoreService.subscribeToListTasks(
        listId,
        (updatedTasks) => {
          setTasks(updatedTasks);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      // Load today's tasks
      loadTodayTasks();
    }
  }, [currentUser, listId]);

  const loadTodayTasks = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const todayTasks = await firestoreService.getTodayTasks(currentUser.uid);
      setTasks(todayTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
      notes?: string;
      dueDate?: string;
      priority?: 0 | 1 | 2;
    listId?: string;
  }) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      const newTaskData: Omit<Task, 'id' | 'updatedAt'> = {
        title: taskData.title,
        notes: taskData.notes,
        dueDate: taskData.dueDate,
        priority: taskData.priority || 0,
        completed: false,
        listId: taskData.listId || 'default',
        createdBy: currentUser.uid,
        assignedTo: currentUser.uid,
      };
      
      const taskId = await firestoreService.createTask(newTaskData);
      
      // The real-time listener will update the state automatically
      return { id: taskId, ...newTaskData };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!currentUser) throw new Error('Not authenticated');
      
    try {
      await firestoreService.updateTask(taskId, updates);
      // The real-time listener will update the state automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      await firestoreService.deleteTask(taskId);
      // The real-time listener will update the state automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  const toggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    await updateTask(taskId, { completed: !task.completed });
  };

  const reorderTasks = async (newOrder: Task[]) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      // Update local state immediately for better UX
      setTasks(newOrder);
      
      // Update each task's order in Firestore
      const updatePromises = newOrder.map((task, index) => 
        firestoreService.updateTask(task.id, { 
          order: index,
          updatedAt: new Date().toISOString()
        })
      );
      
      await Promise.all(updatePromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks');
      // Revert local state on error
      refetch();
      throw err;
    }
  };

  const refetch = async () => {
    if (listId && currentUser) {
      try {
        setLoading(true);
        const listTasks = await firestoreService.getListTasks(listId);
        setTasks(listTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
      }
    } else {
      loadTodayTasks();
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    refetch,
  };
}
