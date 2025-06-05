import { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '../hooks/useLists';
import type { Task } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { listId } = useParams();
  const { lists } = useLists();
  const navigate = useNavigate();
  
  // Determine which tasks to search based on current page
  const isToday = location.pathname === '/';
  const currentListId = isToday ? 'today' : listId;
  const { tasks } = useTasks(currentListId);
  
  const currentList = useMemo(() => {
    if (isToday) {
      return { name: 'Mein Tag', id: 'today' };
    }
    return lists.find(l => l.id === listId);
  }, [isToday, lists, listId]);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      (task.notes && task.notes.toLowerCase().includes(query))
    );
  }, [tasks, searchQuery]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleGoToTask = (task: Task) => {
    // Navigate to the appropriate list
    if (task.listId === 'today') {
      navigate('/');
    } else {
      navigate(`/list/${task.listId}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 2:
        return <span className="text-red-500 text-sm">🔴</span>;
      case 1:
        return <span className="text-orange-500 text-sm">🟡</span>;
      default:
        return <span className="text-gray-500 text-sm">🔘</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-black rounded-lg w-full max-w-2xl border border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-800">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={`Aufgaben in "${currentList?.name}" durchsuchen...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Suchen Sie nach Aufgaben</h3>
              <p className="text-gray-500">
                Geben Sie einen Suchbegriff ein, um Aufgaben in "{currentList?.name}" zu finden.
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.044-5.709-2.573M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Keine Ergebnisse</h3>
              <p className="text-gray-500">
                Keine Aufgaben gefunden für "{searchQuery}" in "{currentList?.name}".
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="text-sm text-gray-400 px-2 mb-3">
                {filteredTasks.length} Ergebnis{filteredTasks.length !== 1 ? 'se' : ''} gefunden
              </div>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border transition-colors hover:bg-gray-800 ${
                    task.completed
                      ? 'bg-gray-900/50 border-gray-800 opacity-60'
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-1">
                      {getPriorityIcon(task.priority)}
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                          task.completed
                            ? 'bg-[#0078d4] border-[#0078d4]'
                            : 'border-gray-500 hover:border-[#0078d4]'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      {task.notes && (
                        <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-600' : 'text-gray-400'}`}>
                          {task.notes}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(task.dueDate).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={() => handleGoToTask(task)}
                        className="px-3 py-1.5 text-xs bg-[#47a528] hover:bg-[#3d8b22] text-white rounded-md transition-colors"
                        title="Zur Aufgabe"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Durchsucht wird nur "{currentList?.name}" • ESC zum Schließen • ⌘K / Ctrl+K zum Öffnen
          </p>
        </div>
      </div>
    </div>
  );
} 