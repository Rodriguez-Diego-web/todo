import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLists } from '../hooks/useLists';

interface ListSidebarProps {
  onNavigate?: () => void;
}

export function ListSidebar({ onNavigate }: ListSidebarProps = {}) {
  const { lists, createList, updateList, deleteList } = useLists();
  const { listId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [hoveredList, setHoveredList] = useState<string | null>(null);
  const [shareListId, setShareListId] = useState<string | null>(null);

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
      await updateList(id, editName.trim());
      setEditingId(null);
    }
  };

  const handleDeleteList = async (id: string) => {
    if (confirm('Möchten Sie diese Liste wirklich löschen?')) {
      await deleteList(id);
    }
  };

  const handleShareList = (id: string) => {
    setShareListId(id);
  };

  // Mock task counts - in real app this would come from the task data
  const getTaskCount = (listId: string) => {
    const mockCounts: Record<string, number> = {
      'list-1': 48,
      'list-2': 22,
      'list-3': 5,
      'list-4': 16,
    };
    return mockCounts[listId] || Math.floor(Math.random() * 50);
  };

  return (
    <div className="px-1">
      <div className="space-y-1">
        {lists.map((list) => (
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
                  <svg 
                    className="ms-list-icon text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="truncate text-sm font-medium">{list.name}</span>
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
                          handleShareList(list.id);
                        }}
                        className="p-1.5 rounded-md hover:bg-[#505050] text-gray-400 hover:text-blue-400 transition-colors"
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
                        className="p-1.5 rounded-md hover:bg-[#505050] text-gray-400 hover:text-white transition-colors"
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
                        className="p-1.5 rounded-md hover:bg-[#505050] text-gray-400 hover:text-red-400 transition-colors"
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
          </div>
        ))}
      </div>
      
      {/* Share Modal */}
      {shareListId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Liste teilen</h3>
              <button 
                onClick={() => setShareListId(null)}
                className="p-1 hover:bg-[#404040] rounded"
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
                  className="ms-input"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Berechtigung
                  </label>
                  <select className="ms-input">
                    <option value="editor">Bearbeiten</option>
                    <option value="viewer">Nur anzeigen</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShareListId(null)}
                  className="flex-1 ms-button-secondary"
                >
                  Abbrechen
                </button>
                <button className="flex-1 ms-button-primary">
                  Einladung senden
                </button>
              </div>
            </div>
            
            {/* Current collaborators */}
            <div className="mt-6 pt-4 border-t border-[#404040]">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Geteilt mit</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-[#404040]/30 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    JD
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">John Doe</p>
                    <p className="text-xs text-gray-400">john@example.com</p>
                  </div>
                  <span className="text-xs text-gray-400">Bearbeiter</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-[#404040]/30 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    AS
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Anna Schmidt</p>
                    <p className="text-xs text-gray-400">anna@example.com</p>
                  </div>
                  <span className="text-xs text-gray-400">Betrachter</span>
                </div>
              </div>
            </div>
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
          className="w-full flex items-center px-4 py-3 mx-3 text-sm text-gray-400 hover:text-white hover:bg-[#404040] rounded-lg transition-all duration-200 mt-2"
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
