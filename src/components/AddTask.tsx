import React, { useState } from 'react';

interface AddTaskProps {
  onAdd: (title: string, options?: {
    notes?: string;
    dueDate?: string;
    priority?: 0 | 1 | 2;
  }) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<0 | 1 | 2>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), {
        notes: notes.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
      setTitle('');
      setNotes('');
      setDueDate('');
      setPriority(0);
      setIsExpanded(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Neue Aufgabe hinzufügen..."
            className="w-full px-3 py-2 bg-transparent focus:outline-none"
            onFocus={() => setIsExpanded(true)}
          />
        </div>
        
        {isExpanded && (
          <>
            <div className="px-4 pb-4 space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notizen hinzufügen..."
                className="input-field resize-none"
                rows={2}
              />
              
              <div className="flex gap-3">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field flex-1"
                />
                
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) as 0 | 1 | 2)}
                  className="input-field flex-1"
                >
                  <option value={0}>Niedrige Priorität</option>
                  <option value={1}>Mittlere Priorität</option>
                  <option value={2}>Hohe Priorität</option>
                </select>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setNotes('');
                  setDueDate('');
                  setPriority(0);
                }}
                className="btn-secondary text-sm"
              >
                Abbrechen
              </button>
              <button type="submit" className="btn-primary text-sm">
                Aufgabe hinzufügen
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
