import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '../hooks/useLists';
import { DragDropTaskList } from '../components/DragDropTaskList';
import { AddTask } from '../components/AddTask';
import type { Task } from '../types';

export function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { lists } = useLists();
  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask, reorderTasks } = useTasks(listId);
  
  const currentList = lists.find(l => l.id === listId);

  useEffect(() => {
    if (!loading && !currentList && lists.length > 0) {
      navigate('/');
    }
  }, [currentList, lists, loading, navigate]);

  const handleAddTask = async (
    title: string, 
    options?: {
      notes?: string;
      dueDate?: string;
      priority?: 0 | 1 | 2;
    }
  ) => {
    if (!listId) return;
    
    await createTask({
      title,
      notes: options?.notes,
      dueDate: options?.dueDate,
      priority: options?.priority || 0,
      listId
    });
  };

  const handleTaskReorder = async (newOrder: Task[]) => {
    if (!listId) return;
    await reorderTasks(newOrder);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#404040] rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#404040] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">Fehler: {error}</p>
        </div>
      </div>
    );
  }

  if (!currentList) {
    return null;
  }

  // Sort tasks by priority (High -> Medium -> Low) and creation time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Incomplete tasks first
    }
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });

  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header - Mobile optimized */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentList.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{incompleteTasks.length} offene Aufgaben</span>
          {completedTasks.length > 0 && (
            <span>{completedTasks.length} erledigt</span>
          )}
        </div>
      </header>

      {/* Add Task - Mobile optimized */}
      <div className="mb-6">
        <AddTask onAdd={handleAddTask} />
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">Keine Aufgaben</h3>
          <p className="text-gray-400">
            Diese Liste ist noch leer. Fügen Sie Ihre erste Aufgabe hinzu!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incomplete Tasks with Drag & Drop */}
          {incompleteTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Aufgaben ({incompleteTasks.length})
                </h2>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  Ziehen zum Sortieren
                </div>
              </div>
              <DragDropTaskList
                tasks={incompleteTasks}
                onTaskToggle={toggleComplete}
                onTaskUpdate={updateTask}
                onTaskDelete={deleteTask}
                onTaskReorder={handleTaskReorder}
              />
            </div>
          )}

          {/* Completed Tasks - No drag/drop needed */}
          {completedTasks.length > 0 && (
            <div className="pt-6 border-t border-[#404040]">
              <h2 className="text-lg font-semibold text-gray-300 mb-4">
                Erledigt ({completedTasks.length})
              </h2>
              <div className="opacity-60">
                <DragDropTaskList
                  tasks={completedTasks}
                  onTaskToggle={toggleComplete}
                  onTaskUpdate={updateTask}
                  onTaskDelete={deleteTask}
                  onTaskReorder={() => {}} // No reordering for completed tasks
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
