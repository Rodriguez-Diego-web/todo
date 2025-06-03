import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLists } from '../hooks/useLists';
import { useTasks } from '../hooks/useTasks';

export function ListSidebar() {
  const { lists, createList, updateList, deleteList } = useLists();
  const { listId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      await createList(newListName.trim());
      setNewListName('');
      setIsCreating(false);
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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300">Meine Listen</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateList} className="mb-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Neue Liste..."
            className="input-field text-sm"
            autoFocus
            onBlur={() => {
              if (!newListName.trim()) setIsCreating(false);
            }}
          />
        </form>
      )}

      <div className="space-y-1">
        {lists.map((list) => (
          <div key={list.id} className="group">
            {editingId === list.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleUpdateList(list.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateList(list.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="input-field text-sm"
                autoFocus
              />
            ) : (
              <Link
                to={`/list/${list.id}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  listId === list.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {list.name}
                </span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingId(list.id);
                      setEditName(list.name);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteList(list.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
