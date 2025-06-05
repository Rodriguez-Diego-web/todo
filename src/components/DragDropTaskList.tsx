import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import type { Task } from '../types';

interface SortableTaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

function SortableTaskItem({ task, onToggle, onUpdate, onDelete }: SortableTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  
  // Swipe-to-delete states
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeDeleteMode, setIsSwipeDeleteMode] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  // Check if user has been warned about swipe delete before
  const hasBeenWarned = () => {
    return localStorage.getItem('swipe-delete-warned') === 'true';
  };

  const setWarned = () => {
    localStorage.setItem('swipe-delete-warned', 'true');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDragging) return;
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    
    // Start long press timer
    setTimeout(() => {
      if (touchStart && Date.now() - touchStart.time >= 500) {
        setIsLongPressing(true);
        setIsSwipeDeleteMode(true);
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isLongPressing) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    
    // Only allow horizontal swipe (prevent vertical scrolling interference)
    if (deltaY > 30) {
      setIsLongPressing(false);
      setIsSwipeDeleteMode(false);
      setSwipeOffset(0);
      return;
    }
    
    // Only track right swipe (positive deltaX)
    if (deltaX > 0 && deltaX < 150) {
      setSwipeOffset(deltaX);
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!touchStart || !isLongPressing) {
      setTouchStart(null);
      setIsLongPressing(false);
      setSwipeOffset(0);
      setIsSwipeDeleteMode(false);
      return;
    }
    
    // If swiped far enough (more than 100px), trigger delete
    if (swipeOffset > 100) {
      if (hasBeenWarned()) {
        // Delete immediately without confirmation
        onDelete(task.id);
      } else {
        // Ask for confirmation first time
        const confirmed = window.confirm('Möchten Sie diese Aufgabe wirklich löschen? (Diese Frage wird nur einmal gestellt)');
        if (confirmed) {
          setWarned();
          onDelete(task.id);
        }
      }
    }
    
    // Reset states
    setTouchStart(null);
    setIsLongPressing(false);
    setSwipeOffset(0);
    setIsSwipeDeleteMode(false);
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      notes: editNotes || undefined,
      dueDate: editDueDate || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="w-full mb-1">
        <div className="bg-[#2d2d2d] border-b border-[#404040] p-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white mb-3"
            autoFocus
          />
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Notizen hinzufügen..."
            className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white resize-none mb-3"
            rows={3}
          />
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fälligkeitsdatum</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priorität</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(Number(e.target.value) as 0 | 1 | 2)}
                className="w-full bg-[#1f1f1f] border border-[#404040] rounded-lg px-3 py-2 text-white"
              >
                <option value={0}>🔘 Niedrig</option>
                <option value={1}>🟡 Mittel</option>
                <option value={2}>🔴 Hoch</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Speichern
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full group touch-manipulation relative overflow-hidden"
      {...(isSwipeDeleteMode ? {} : { ...attributes, ...listeners })}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Delete indicator background */}
      {isSwipeDeleteMode && (
        <div 
          className="absolute inset-0 bg-red-600 flex items-center justify-end pr-4 z-0"
          style={{ opacity: Math.min(swipeOffset / 100, 1) }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      )}

      <div 
        className={`flex items-center py-3 px-4 border-b border-[#404040] transition-all duration-200 relative z-10 ${
          isDragging ? 'bg-[#2d2d2d]' : ''
        } ${isSwipeDeleteMode ? 'bg-[#1f1f1f]' : ''}`}
        style={{
          transform: isSwipeDeleteMode ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwipeDeleteMode ? 'none' : undefined
        }}
      >
        
        {/* Checkbox with larger touch area */}
        <div className="flex-shrink-0 -ml-2 -my-2 p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`block w-5 h-5 rounded-full border-2 relative transition-all duration-200 ${
              task.completed 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-gray-400 hover:border-blue-400'
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3 text-white absolute inset-0 m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Task Title - not clickable */}
        <div className="flex-1 min-w-0 ml-2">
          <h3 className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
          {task.notes && (
            <p className="text-sm text-gray-400 mt-1">{task.notes}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(task.dueDate).toLocaleDateString('de-DE', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </p>
          )}
        </div>
        
        {/* Long press hint for mobile */}
        {!isSwipeDeleteMode && (
          <div className="flex-shrink-0 ml-2 md:hidden">
            <div className="text-xs text-gray-500 text-center">
              <div>Lang drücken</div>
              <div>& wischen →</div>
            </div>
          </div>
        )}
        
        {/* Star Icon (Favorite) - Hidden on mobile, visible on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add favorite functionality
          }}
          className="flex-shrink-0 ml-4 p-2 rounded-md transition-colors hidden md:block hover:bg-[#404040]"
          title="Zu Favoriten hinzufügen"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Desktop Edit/Delete Buttons */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:bg-[#404040] rounded-md transition-colors opacity-0 group-hover:opacity-100"
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
            className="p-1 hover:bg-red-900/30 rounded-md transition-colors text-red-400 opacity-0 group-hover:opacity-100"
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

interface DragDropTaskListProps {
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskDelete: (id: string) => void;
  onTaskReorder: (newOrder: Task[]) => void;
}

export function DragDropTaskList({
  tasks,
  onTaskToggle,
  onTaskUpdate,
  onTaskDelete,
  onTaskReorder,
}: DragDropTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Increased from 10 to prevent accidental drags
        delay: 250, // Increased delay to allow quick taps on checkbox
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(tasks, oldIndex, newIndex);
        console.log('Reordering tasks:', { oldIndex, newIndex, newOrder: newOrder.map(t => t.title) });
        onTaskReorder(newOrder);
      }
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">Keine Aufgaben</h3>
        <p className="text-gray-400">Füge deine erste Aufgabe hinzu!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="bg-[#1f1f1f] rounded-lg overflow-hidden">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onToggle={onTaskToggle}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 