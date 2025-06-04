import React, { useState } from 'react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editPriority, setEditPriority] = useState(task.priority);

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      notes: editNotes || undefined,
      dueDate: editDueDate || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const priorityColors = {
    0: 'text-gray-500',
    1: 'text-orange-500',
    2: 'text-red-500',
  };

  const priorityLabels = {
    0: 'Niedrig',
    1: 'Mittel',
    2: 'Hoch',
  };

  if (isEditing) {
    return (
      <div className="w-full ms-card p-6">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="ms-input mb-4 font-medium"
          autoFocus
        />
        <textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notizen hinzufügen..."
          className="ms-input mb-4 resize-none"
          rows={3}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fälligkeitsdatum</label>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="ms-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Priorität</label>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(Number(e.target.value) as 0 | 1 | 2)}
              className="ms-input"
            >
              <option value={0}>Niedrig</option>
              <option value={1}>Mittel</option>
              <option value={2}>Hoch</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="ms-button-primary">
            Speichern
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="ms-button-secondary"
          >
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full group">
      <div className="flex items-center gap-4 bg-[#2d2d2d] border border-[#404040] rounded-lg px-4 py-3 transition-all duration-200 hover:bg-[#363636] hover:border-[#505050] cursor-pointer"
           onClick={() => onToggle(task.id)}>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`flex-shrink-0 ${task.completed ? 'ms-checkbox checked' : 'ms-checkbox'}`}
        >
          {task.completed && (
            <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className={`font-medium text-white ${task.completed ? 'line-through opacity-60' : ''} flex-1`}>
              {task.title}
            </h3>
            
            {/* User Avatar for assigned tasks */}
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {task.assignedTo.substring(0, 2).toUpperCase()}
                </div>
              </div>
            )}
            
            {/* Priority and Date indicators */}
            <div className="flex items-center gap-2 text-xs">
              {task.priority > 0 && (
                <span className={`flex items-center gap-1 ${priorityColors[task.priority]} bg-[#404040] px-2 py-1 rounded-md`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {priorityLabels[task.priority]}
                </span>
              )}
              
              {task.dueDate && (
                <span className="flex items-center gap-1 text-gray-400 bg-[#404040] px-2 py-1 rounded-md">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString('de-DE', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              )}
            </div>
          </div>
          
          {task.notes && (
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{task.notes}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-2 hover:bg-[#505050] rounded-md transition-colors"
            title="Bearbeiten"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-2 hover:bg-red-900/30 rounded-md transition-colors text-red-400"
            title="Löschen"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
