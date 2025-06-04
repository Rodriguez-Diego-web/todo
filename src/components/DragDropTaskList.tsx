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
    opacity: isDragging ? 0.5 : 1,
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

  const priorityConfig = {
    0: { color: 'border-l-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Niedrig' },
    1: { color: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-500', label: 'Mittel' },
    2: { color: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-500', label: 'Hoch' },
  };

  const config = priorityConfig[task.priority];

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="w-full mb-3">
        <div className="bg-[#2d2d2d] border border-[#404040] rounded-lg p-4">
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
      className="w-full mb-3 group touch-manipulation"
    >
      <div className={`bg-[#2d2d2d] border border-[#404040] ${config.color} border-l-4 rounded-lg transition-all duration-200 hover:bg-[#363636] hover:border-[#505050] ${config.bg} ${isDragging ? 'shadow-lg scale-105 rotate-1' : ''}`}>
        
        {/* Drag Handle & Content */}
        <div className="flex items-center gap-3 p-4">
          
          {/* Drag Handle - Mobile optimized */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 p-2 cursor-grab active:cursor-grabbing touch-manipulation hover:bg-[#505050] rounded-md transition-colors"
            style={{ touchAction: 'manipulation' }}
            title="Ziehen zum Verschieben"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 relative transition-all duration-200 ${
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
          
          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={`font-medium text-white ${task.completed ? 'line-through opacity-60' : ''} flex-1 pr-2`}>
                {task.title}
              </h3>
              
              {/* Priority Badge - Mobile optimized */}
              {task.priority > 0 && (
                <span className={`flex items-center gap-1 ${config.text} text-xs px-2 py-1 rounded-full border`}>
                  <div className={`w-2 h-2 rounded-full ${config.color.replace('border-l-', 'bg-')}`} />
                  {config.label}
                </span>
              )}
            </div>
            
            {/* Date & Notes */}
            <div className="flex items-center gap-2 mt-1">
              {task.dueDate && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString('de-DE', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              )}
              
              {task.assignedTo && (
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {task.assignedTo.substring(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            
            {task.notes && (
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{task.notes}</p>
            )}
          </div>
          
          {/* Action Buttons */}
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
        distance: 10, // Increased distance for better mobile experience
        delay: 100, // Small delay to distinguish from taps
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
        <div className="space-y-1">
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