import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '../hooks/useLists';
import { DragDropTaskList } from '../components/DragDropTaskList';
import { AddTask } from '../components/AddTask';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import type { Task } from '../types';
import type { Timestamp } from 'firebase/firestore';

export function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { lists } = useLists();
  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask, reorderTasks } = useTasks(listId);
  const { currentUser } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  
  const currentList = lists.find(l => l.id === listId);

  useEffect(() => {
    if (!loading && !currentList && lists.length > 0) {
      navigate('/');
    }
  }, [currentList, lists, loading, navigate]);

  // Helper function to convert Timestamp to Date
  const toDate = (timestamp: string | Timestamp | null | undefined): Date => {
    if (!timestamp) {
      return new Date(); // Return current date as fallback
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    // Firebase Timestamp
    return timestamp.toDate();
  };

  const handleAddTask = async (
    title: string, 
    options?: {
      notes?: string;
      dueDate?: string;
      priority?: 0 | 1 | 2;
    }
  ) => {
    if (!listId) return;
    
    await createTask({
      title,
      notes: options?.notes,
      dueDate: options?.dueDate,
      priority: options?.priority || 0,
      listId
    });
  };

  const handleTaskReorder = async (newOrder: Task[]) => {
    if (!listId) return;
    await reorderTasks(newOrder);
  };

  const handleSendInvitation = async () => {
    if (!currentUser || !listId || !inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      await firestoreService.createInvitation({
        listId,
        inviterUserId: currentUser.uid,
        inviteeEmail: inviteEmail.trim(),
        status: 'pending'
      });
      
      // Reset form and close modal
      setInviteEmail('');
      setShowShareModal(false);
      alert('Einladung erfolgreich gesendet!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Fehler beim Senden der Einladung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#404040] rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#404040] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">Fehler: {error}</p>
        </div>
      </div>
    );
  }

  if (!currentList) {
    return null;
  }

  // Sort tasks: first by completion status, then by manual order (if exists), then by priority, then by creation time
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // 2. If both have manual order, use that
    if (typeof a.order === 'number' && typeof b.order === 'number') {
      return a.order - b.order;
    }
    
    // 3. If only one has order, it comes first
    if (typeof a.order === 'number' && typeof b.order !== 'number') {
      return -1;
    }
    if (typeof a.order !== 'number' && typeof b.order === 'number') {
      return 1;
    }
    
    // 4. Priority sorting (higher priority first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // 5. Creation time (newer first)
    return toDate(a.updatedAt).getTime() - toDate(b.updatedAt).getTime();
  });

  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header - Mobile optimized */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentList.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{incompleteTasks.length} offene Aufgaben</span>
          {completedTasks.length > 0 && (
            <span>{completedTasks.length} erledigt</span>
          )}
        </div>
      </header>

      {/* Add Task - Mobile optimized */}
      <div className="mb-6">
        <AddTask onAdd={handleAddTask} />
      </div>

      {/* Mobile Share Button */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personen einladen
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">Keine Aufgaben</h3>
          <p className="text-gray-400">
            Diese Liste ist noch leer. Fügen Sie Ihre erste Aufgabe hinzu!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incomplete Tasks with Drag & Drop */}
          {incompleteTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Aufgaben ({incompleteTasks.length})
                </h2>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  Ziehen zum Sortieren
                </div>
              </div>
              <DragDropTaskList
                tasks={incompleteTasks}
                onTaskToggle={toggleComplete}
                onTaskUpdate={updateTask}
                onTaskDelete={deleteTask}
                onTaskReorder={handleTaskReorder}
              />
            </div>
          )}

          {/* Completed Tasks - No drag/drop needed */}
          {completedTasks.length > 0 && (
            <div className="pt-6 border-t border-[#404040]">
              <h2 className="text-lg font-semibold text-gray-300 mb-4">
                Erledigt ({completedTasks.length})
              </h2>
              <div className="opacity-60">
                <DragDropTaskList
                  tasks={completedTasks}
                  onTaskToggle={toggleComplete}
                  onTaskUpdate={updateTask}
                  onTaskDelete={deleteTask}
                  onTaskReorder={() => {}} // No reordering for completed tasks
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d2d2d] rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#404040]">
              <h3 className="text-lg font-semibold text-white">
                Liste teilen: {currentList?.name}
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-[#404040] rounded"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-Mail-Adresse eingeben
                </label>
                <input
                  type="email"
                  placeholder="beispiel@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Berechtigung
                </label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white"
                >
                  <option value="editor">Bearbeiten</option>
                  <option value="viewer">Nur anzeigen</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  disabled={isInviting}
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleSendInvitation}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInviting ? 'Sende...' : 'Einladung senden'}
                </button>
              </div>
              
              {/* Shared with info */}
              {currentList?.sharedWith && currentList.sharedWith.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#404040]">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Geteilt mit {currentList.sharedWith.length} Personen
                  </h4>
                  <p className="text-xs text-gray-400">
                    Geteilte Benutzer werden hier angezeigt, sobald sie die Einladung annehmen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
