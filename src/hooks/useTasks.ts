import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import * as db from '../db';
import { v4 as uuidv4 } from 'uuid';

export function useTasks(listId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      let loadedTasks: Task[];
      
      if (listId) {
        loadedTasks = await db.getTasksByList(listId);
      } else {
        loadedTasks = await db.getAllTasks();
      }
      
      setTasks(loadedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (
    title: string,
    listId: string,
    options?: {
      notes?: string;
      dueDate?: string;
      priority?: 0 | 1 | 2;
    }
  ) => {
    try {
      const newTask: Task = {
        id: uuidv4(),
        listId,
        title,
        notes: options?.notes,
        dueDate: options?.dueDate,
        priority: options?.priority || 0,
        completed: false,
        updatedAt: new Date().toISOString(),
      };
      await db.createTask(newTask);
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      
      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await db.updateTask(updatedTask);
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await db.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    refetch: loadTasks,
  };
}

export function useTodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodayTasks();
  }, []);

  const loadTodayTasks = async () => {
    try {
      setLoading(true);
      const todayTasks = await db.getTasksDueToday();
      setTasks(todayTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load today tasks');
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    refetch: loadTodayTasks,
  };
}
