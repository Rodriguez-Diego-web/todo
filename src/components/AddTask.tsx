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
    <form onSubmit={handleSubmit} className="w-full mb-6">
      <div className="bg-[#2d2d2d] border border-[#404040] rounded-lg transition-all duration-200 hover:border-[#505050]">
        <div className="px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex-shrink-0"></div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Neue Aufgabe hinzufügen..."
              className="flex-1 text-white bg-transparent focus:outline-none placeholder-gray-400"
              onFocus={() => setIsExpanded(true)}
              autoComplete="off"
            />
          </div>
        </div>
        
        {isExpanded && (
          <>
            <div className="px-4 pb-4 space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notizen hinzufügen..."
                className="ms-input resize-none text-sm"
                rows={3}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="ms-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorität
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as 0 | 1 | 2)}
                    className="ms-input"
                  >
                    <option value={0}>Niedrig</option>
                    <option value={1}>Mittel</option>
                    <option value={2}>Hoch</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-[#404040]/30 border-t border-[#404040] flex justify-end gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setNotes('');
                  setDueDate('');
                  setPriority(0);
                }}
                className="ms-button-secondary"
              >
                Abbrechen
              </button>
              <button type="submit" className="ms-button-primary">
                Aufgabe hinzufügen
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
