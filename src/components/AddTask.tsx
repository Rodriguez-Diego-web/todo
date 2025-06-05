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

  const priorityOptions = [
    { value: 0, label: 'Niedrig', emoji: '🔘', color: 'text-gray-500' },
    { value: 1, label: 'Mittel', emoji: '🟡', color: 'text-orange-500' },
    { value: 2, label: 'Hoch', emoji: '🔴', color: 'text-red-500' },
  ];

  const currentPriorityOption = priorityOptions[priority];

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
      <div className="bg-[#2d2d2d] border border-[#404040] rounded-lg transition-all duration-200 hover:border-[#505050] focus-within:border-blue-500">
        
        {/* Main Input */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-gray-500 flex-shrink-0"></div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Neue Aufgabe hinzufügen..."
              className="flex-1 text-white bg-transparent focus:outline-none placeholder-gray-400 text-base"
              onFocus={() => {
                setIsExpanded(true);
                // Scroll input into view on mobile to prevent gray screen
                setTimeout(() => {
                  if (window.innerWidth < 768) {
                    window.scrollTo(0, 0);
                  }
                }, 300);
              }}
              autoComplete="off"
            />
            
            {/* Priority indicator when collapsed */}
            {!isExpanded && priority > 0 && (
              <span className={`text-sm ${currentPriorityOption.color} flex items-center gap-1`}>
                {currentPriorityOption.emoji}
                {currentPriorityOption.label}
              </span>
            )}
          </div>
        </div>
        
        {/* Expanded Form */}
        {isExpanded && (
          <>
            {/* Notes */}
            <div className="px-4 pb-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notizen hinzufügen..."
                className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white resize-none text-sm focus:outline-none focus:border-blue-500"
                rows={3}
              />
            </div>
            
            {/* Priority & Date - Mobile optimized */}
            <div className="px-4 pb-4 space-y-4">
              
              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Priorität
                </label>
                <div className="flex gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriority(option.value as 0 | 1 | 2)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                        priority === option.value
                          ? `border-blue-500 bg-blue-500/10 ${option.color}`
                          : 'border-[#404040] hover:border-[#505050] text-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{option.emoji}</span>
                        <span className="text-xs font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fälligkeitsdatum
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="px-4 py-3 bg-[#404040]/30 border-t border-[#404040] flex gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setNotes('');
                  setDueDate('');
                  setPriority(0);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
              >
                Abbrechen
              </button>
              <button 
                type="submit" 
                disabled={!title.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium"
              >
                Hinzufügen
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
