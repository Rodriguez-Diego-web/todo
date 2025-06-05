import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLists } from '../hooks/useLists';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { listColors, getListColor } from '../config/colors';

interface ListSidebarProps {
  onNavigate?: () => void;
}

export function ListSidebar({ onNavigate }: ListSidebarProps = {}) {
  const { lists, createList, updateList, deleteList } = useLists();
  const { currentUser } = useAuth();
  const { listId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [hoveredList, setHoveredList] = useState<string | null>(null);
  const [shareListId, setShareListId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [colorMenuId, setColorMenuId] = useState<string | null>(null);

  // Load task counts for all lists with real-time updates
  useEffect(() => {
    if (lists.length === 0) return;

    const unsubscribers: (() => void)[] = [];
    const counts: Record<string, number> = {};

    // Subscribe to each list's tasks for real-time updates
    lists.forEach(list => {
      const unsubscribe = firestoreService.subscribeToListTasks(list.id, (tasks) => {
        // Count incomplete tasks only
        counts[list.id] = tasks.filter(task => !task.completed).length;
        setTaskCounts({...counts});
      });
      unsubscribers.push(unsubscribe);
    });

    // Cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [lists]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      await createList(newListName.trim());
      setNewListName('');
      setIsCreating(false);
      onNavigate?.();
    }
  };

  const handleUpdateList = async (id: string) => {
    if (editName.trim()) {
      await updateList(id, { name: editName.trim() });
      setEditingId(null);
    }
  };

  const handleUpdateListColor = async (id: string, color: string) => {
    await updateList(id, { color });
    setColorMenuId(null);
  };

  const handleDeleteList = async (id: string) => {
    await deleteList(id);
  };

  const handleShareList = (id: string) => {
    setShareListId(id);
    setInviteEmail('');
    setInviteRole('editor');
  };

  const handleSendInvitation = async () => {
    if (!currentUser || !shareListId || !inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      await firestoreService.createInvitation({
        listId: shareListId,
        inviterUserId: currentUser.uid,
        inviteeEmail: inviteEmail.trim(),
        status: 'pending'
      });
      
      // Reset form and close modal
      setInviteEmail('');
      setShareListId(null);
      alert('Einladung erfolgreich gesendet!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Fehler beim Senden der Einladung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsInviting(false);
    }
  };

  // Get real task count for a list
  const getTaskCount = (listId: string) => {
    return taskCounts[listId] || 0;
  };

  const currentList = lists.find(l => l.id === shareListId);

  return (
    <div className="px-1">
      <div className="space-y-1">
        {lists.map((list) => {
          const listColor = getListColor(list.color);
          return (
            <div 
              key={list.id}
              className="group relative"
              onMouseEnter={() => setHoveredList(list.id)}
              onMouseLeave={() => setHoveredList(null)}
            >
              {editingId === list.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateList(list.id);
                  }}
                  className="px-3 py-2"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    className="ms-input text-sm py-2"
                  />
                </form>
              ) : (
                <Link
                  to={`/list/${list.id}`}
                  onClick={onNavigate}
                  className={`ms-sidebar-item ${listId === list.id ? 'active' : ''} group`}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {/* Color indicator */}
                    <div 
                      className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: listColor.value }}
                    />
                    <svg 
                      className="ms-list-icon text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span 
                      className="truncate text-sm font-medium"
                      style={{ color: listColor.value }}
                    >
                      {list.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="ms-count-badge">{getTaskCount(list.id)}</span>
                    
                    {hoveredList === list.id && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setColorMenuId(colorMenuId === list.id ? null : list.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                          title="Farbe ändern"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a6 6 0 00-2-4l-2-2a6 6 0 00-4-2H7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShareList(list.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-[#47a528] transition-colors"
                          title="Liste teilen"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditName(list.name);
                            setEditingId(list.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                          title="Liste umbenennen"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                          title="Liste löschen"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              )}
              
              {/* Color picker dropdown */}
              {colorMenuId === list.id && (
                <div className="absolute right-0 top-full mt-1 bg-black border border-gray-800 rounded-lg shadow-lg p-2 z-20">
                  <div className="grid grid-cols-3 gap-1">
                    {listColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleUpdateListColor(list.id, color.value)}
                        className={`w-8 h-8 rounded-md hover:scale-110 transition-transform ${
                          list.color === color.value ? 'ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Share Modal */}
      {shareListId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 w-96 max-w-md mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Liste teilen: {currentList?.name}
              </h3>
              <button 
                onClick={() => setShareListId(null)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-Mail-Adresse eingeben
                </label>
                <input
                  type="email"
                  placeholder="beispiel@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="ms-input"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Berechtigung
                  </label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                    className="ms-input"
                  >
                    <option value="editor">Bearbeiten</option>
                    <option value="viewer">Nur anzeigen</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShareListId(null)}
                  className="flex-1 ms-button-secondary"
                  disabled={isInviting}
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleSendInvitation}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="flex-1 bg-[#47a528] hover:bg-[#3d8b22] text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInviting ? 'Sende...' : 'Einladung senden'}
                </button>
              </div>
            </div>
            
            {/* Shared with info */}
            {currentList?.sharedWith && currentList.sharedWith.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-800">
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
      )}
      
      {isCreating ? (
        <form onSubmit={handleCreateList} className="px-3 py-2 mt-3">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onBlur={() => {
              if (!newListName.trim()) {
                setIsCreating(false);
              }
            }}
            autoFocus
            placeholder="Neue Liste..."
            className="ms-input text-sm py-2"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center px-4 py-3 mx-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 mt-2"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neue Liste
        </button>
      )}
    </div>
  );
}
