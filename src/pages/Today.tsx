import { useTasks } from '../hooks/useTasks';
import { DragDropTaskList } from '../components/DragDropTaskList';
import { AddTask } from '../components/AddTask';
import type { Task } from '../types';

export function Today() {
  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask } = useTasks();

  const handleAddTask = async (
    title: string, 
    options?: {
      notes?: string;
      dueDate?: string;
      priority?: 0 | 1 | 2;
    }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    
    await createTask({
      title,
      notes: options?.notes,
      dueDate: options?.dueDate || today,
      priority: options?.priority || 0,
      listId: 'today'
    });
  };

  const handleTaskReorder = async (newOrder: Task[]) => {
    // For today view, we don't need reordering since it's based on due date
    // Just update local state for better UX
    console.log('Today tasks reordered:', newOrder);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
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
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">Fehler: {error}</p>
        </div>
      </div>
    );
  }

  // Sort tasks by priority and completion status
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
  
  const currentDate = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header - Mobile optimized */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Mein Tag</h1>
        </div>
        <p className="text-gray-400 text-sm">{currentDate}</p>
        <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
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

      {/* Motivational Message */}
      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg className="w-20 h-20 mx-auto text-yellow-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Guten Tag! ☀️</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Ein neuer Tag beginnt! Füge deine erste Aufgabe hinzu und starte produktiv in den Tag.
          </p>
        </div>
      ) : incompleteTasks.length === 0 && completedTasks.length > 0 ? (
        <div className="text-center py-12 mb-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Fantastisch! 🎉</h3>
          <p className="text-gray-400">
            Du hast alle Aufgaben für heute erledigt. Großartige Arbeit!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incomplete Tasks */}
          {incompleteTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Heute ({incompleteTasks.length})
                </h2>
                
                {/* Priority Distribution */}
                <div className="flex items-center gap-2 text-xs">
                  {[2, 1, 0].map(priority => {
                    const count = incompleteTasks.filter(t => t.priority === priority).length;
                    const colors: Record<number, string> = { 2: 'text-red-500', 1: 'text-orange-500', 0: 'text-gray-500' };
                    const emojis: Record<number, string> = { 2: '🔴', 1: '🟡', 0: '🔘' };
                    
                    return count > 0 ? (
                      <span key={priority} className={`${colors[priority]} flex items-center gap-1`}>
                        {emojis[priority]} {count}
                      </span>
                    ) : null;
                  })}
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

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="pt-6 border-t border-[#404040]">
              <h2 className="text-lg font-semibold text-gray-300 mb-4">
                Erledigt ({completedTasks.length}) ✅
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
