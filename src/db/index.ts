import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Task, List } from '../types';

interface TaskyDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-list': string; 'by-due': string };
  };
  lists: {
    key: string;
    value: List;
  };
}

let db: IDBPDatabase<TaskyDB>;

export async function initDB() {
  db = await openDB<TaskyDB>('tasky-db', 1, {
    upgrade(db) {
      // Create lists store
      if (!db.objectStoreNames.contains('lists')) {
        db.createObjectStore('lists', { keyPath: 'id' });
      }

      // Create tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-list', 'listId');
        taskStore.createIndex('by-due', 'dueDate');
      }
    },
  });
  return db;
}

// Lists CRUD operations
export async function getAllLists(): Promise<List[]> {
  if (!db) await initDB();
  return db.getAll('lists');
}

export async function getList(id: string): Promise<List | undefined> {
  if (!db) await initDB();
  return db.get('lists', id);
}

export async function createList(list: List): Promise<void> {
  if (!db) await initDB();
  await db.add('lists', list);
}

export async function updateList(list: List): Promise<void> {
  if (!db) await initDB();
  await db.put('lists', list);
}

export async function deleteList(id: string): Promise<void> {
  if (!db) await initDB();
  // Delete all tasks in this list
  const tasks = await getTasksByList(id);
  const tx = db.transaction(['lists', 'tasks'], 'readwrite');
  await Promise.all([
    tx.objectStore('lists').delete(id),
    ...tasks.map(task => tx.objectStore('tasks').delete(task.id))
  ]);
  await tx.done;
}

// Tasks CRUD operations
export async function getAllTasks(): Promise<Task[]> {
  if (!db) await initDB();
  return db.getAll('tasks');
}

export async function getTask(id: string): Promise<Task | undefined> {
  if (!db) await initDB();
  return db.get('tasks', id);
}

export async function getTasksByList(listId: string): Promise<Task[]> {
  if (!db) await initDB();
  return db.getAllFromIndex('tasks', 'by-list', listId);
}

export async function getTasksDueToday(): Promise<Task[]> {
  if (!db) await initDB();
  const today = new Date().toISOString().split('T')[0];
  const allTasks = await db.getAll('tasks');
  return allTasks.filter(task => 
    task.dueDate && task.dueDate.startsWith(today) && !task.completed
  );
}

export async function createTask(task: Task): Promise<void> {
  if (!db) await initDB();
  await db.add('tasks', task);
}

export async function updateTask(task: Task): Promise<void> {
  if (!db) await initDB();
  await db.put('tasks', task);
}

export async function deleteTask(id: string): Promise<void> {
  if (!db) await initDB();
  await db.delete('tasks', id);
}

export async function getTaskCountByList(listId: string): Promise<number> {
  if (!db) await initDB();
  const tasks = await getTasksByList(listId);
  return tasks.filter(task => !task.completed).length;
}
