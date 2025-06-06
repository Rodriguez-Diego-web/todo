import { useTasks } from '../hooks/useTasks';
import { DragDropTaskList } from '../components/DragDropTaskList';
import { AddTask } from '../components/AddTask';
import type { Task } from '../types';
import { PullToRefresh } from '../components/PullToRefresh';

export function Today() {
  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask, reorderTasks, refetch } = useTasks();

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
    try {
      await reorderTasks(newOrder);
      console.log('Today tasks reordered successfully');
    } catch (error) {
      console.error('Failed to reorder today tasks:', error);
    }
  };

  // Helper function to convert Timestamp to Date
  const toDate = (timestamp: string | Date | null | undefined): Date => {
    if (!timestamp) {
      return new Date(); // Return current date as fallback
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    // Must be a Date object
    return timestamp;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 w-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 w-full">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">Fehler: {error}</p>
        </div>
      </div>
    );
  }

  // Sort tasks for today view: incomplete first, then by priority, then by title
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // 2. Order by priority (high to low)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // 3. Order by due date (older first)
    if (a.dueDate && b.dueDate) {
      return toDate(a.dueDate).getTime() - toDate(b.dueDate).getTime();
    }
    
    // 4. Alphabetically by title as last resort
    return (a.title || '').localeCompare(b.title || '');
  });

  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  return (
    <div className="p-4 md:p-8 w-full">
      <PullToRefresh onRefresh={async () => {
        await refetch();
      }}>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Heute</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{incompleteTasks.length} offene Aufgaben</span>
            {completedTasks.length > 0 && (
              <span>{completedTasks.length} erledigt</span>
            )}
          </div>
        </header>

        <div className="mb-6">
          <AddTask onAdd={handleAddTask} />
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-theme-primary mb-2">Keine Aufgaben für heute</h3>
            <p className="text-gray-400">
              Fügen Sie Ihre erste Aufgabe für heute hinzu oder setzen Sie ein Fälligkeitsdatum für eine bestehende Aufgabe.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Incomplete Tasks */}
            {incompleteTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-theme-primary mb-4">
                  Aufgaben ({incompleteTasks.length})
                </h2>
                <DragDropTaskList
                  tasks={incompleteTasks}
                  onTaskToggle={toggleComplete}
                  onTaskUpdate={updateTask}
                  onTaskDelete={deleteTask}
                  onTaskReorder={handleTaskReorder}
                  listColor="#3b82f6"
                />
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="pt-6 border-t border-gray-800">
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
                    listColor="#3b82f6"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </PullToRefresh>
    </div>
  );
}
