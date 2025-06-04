import { useTasks } from '../hooks/useTasks';
import { TaskItem } from '../components/TaskItem';
import { AddTask } from '../components/AddTask';

export function Today() {
  const { tasks: todayTasks, loading, error, refetch, createTask, updateTask, toggleComplete, deleteTask } = useTasks();

  const handleAddTask = async (
    title: string, 
    options?: {
      notes?: string;
      dueDate?: string;
      priority?: 0 | 1 | 2;
    }
  ) => {
    await createTask({
      title,
      notes: options?.notes,
      dueDate: options?.dueDate || new Date().toISOString().split('T')[0], // Default to today
      priority: options?.priority,
      listId: 'today'
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#404040] rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-[#404040] rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#404040] rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-red-300 font-medium">Fehler beim Laden</h3>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={refetch} className="ms-button-primary">
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const completedCount = todayTasks.filter(task => task.completed).length;
  const totalCount = todayTasks.length;

  return (
    <div className="w-full max-w-none p-6">
      <header className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Mein Tag</h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString('de-DE', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </div>
        
        {totalCount > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{totalCount} Aufgaben</span>
            {completedCount > 0 && (
              <span>• {completedCount} erledigt</span>
            )}
          </div>
        )}
      </header>

      <AddTask onAdd={handleAddTask} />

      {todayTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#404040] rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Guten Tag!</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Keine Aufgaben für heute geplant. Fügen Sie eine neue Aufgabe hinzu, um loszulegen.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
