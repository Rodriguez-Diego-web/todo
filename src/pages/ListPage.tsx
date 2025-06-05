import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '../hooks/useLists';
import { DragDropTaskList } from '../components/DragDropTaskList';
import { AddTask } from '../components/AddTask';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { getListColor } from '../config/colors';
import type { Task } from '../types';

export function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { lists } = useLists();
  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask, reorderTasks } = useTasks(listId);
  const { currentUser } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  
  const currentList = lists.find(l => l.id === listId);

  // Prüfen, ob die URL einen share=true Parameter hat
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('share') === 'true') {
      setShowShareModal(true);
      // Parameter aus der URL entfernen
      navigate(`/list/${listId}`, { replace: true });
    }
  }, [location.search, listId, navigate]);

  useEffect(() => {
    if (!loading && !currentList && lists.length > 0) {
      navigate('/');
    }
  }, [currentList, lists, loading, navigate]);

  // Helper function to convert Timestamp to Date
  const toDate = (timestamp: string | Date | null | undefined): Date => {
    if (!timestamp) {
      return new Date(); // Return current date as fallback
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    // Must be a Date object
    return timestamp;
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
      <div className="p-4 md:p-8 w-full">
        <div className="flex flex-col items-center justify-center py-8">
          <img 
            src="/logoweiss.png" 
            alt="Plan Panda Logo" 
            className="w-16 h-16 object-contain mb-4 animate-glow"
          />
          <div className="h-1 w-48 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-500 rounded-full animate-progress"></div>
          </div>
          
          <div className="w-full max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                <div className="h-6 bg-theme-secondary rounded w-1/3"></div>
              </div>
              
              <div className="h-12 bg-theme-secondary rounded-lg w-full"></div>
              
              <div className="space-y-3 mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-theme-secondary rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 w-full">
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
  
  const listColor = getListColor(currentList.color);

  return (
    <div className="p-4 md:p-8 w-full">
      {/* Header - Mobile optimized */}
      <header className="mb-6">
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

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-theme-primary mb-2">Keine Aufgaben</h3>
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
                <h2 className="text-lg font-semibold text-theme-primary">
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
                listColor={listColor.value}
              />
            </div>
          )}

          {/* Completed Tasks - No drag/drop needed */}
          {completedTasks.length > 0 && (
            <div className="pt-6 border-t border-gray-800">
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
                  listColor={listColor.value}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-primary rounded-lg w-full max-w-md border border-theme-primary">
            <div className="flex items-center justify-between p-6 border-b border-theme-primary">
              <h3 className="text-lg font-semibold text-theme-primary">
                Liste teilen: {currentList?.name}
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-theme-secondary rounded"
              >
                <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  E-Mail-Adresse eingeben
                </label>
                <input
                  type="email"
                  placeholder="beispiel@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-theme-secondary border border-theme-primary rounded-lg px-3 py-2 text-theme-primary focus:border-theme-primary focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Berechtigung
                </label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="w-full bg-theme-secondary border border-theme-primary rounded-lg px-3 py-2 text-theme-primary focus:border-theme-primary focus:outline-none"
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
                <div className="mt-6 pt-4 border-t border-theme-primary">
                  <h4 className="text-sm font-medium text-theme-secondary mb-3">
                    Geteilt mit {currentList.sharedWith.length} Personen
                  </h4>
                  <p className="text-xs text-theme-secondary">
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
