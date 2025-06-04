import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useLists } from '../hooks/useLists';
import { TaskItem } from '../components/TaskItem';
import { AddTask } from '../components/AddTask';

export function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { lists } = useLists();
  const { tasks, loading, error, createTask, updateTask, toggleComplete, deleteTask } = useTasks(listId);
  
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
      priority: options?.priority,
      listId
    });
  };

  if (loading) {
    return (
      <div className="p-8">
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
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400">Fehler: {error}</p>
        </div>
      </div>
    );
  }

  if (!currentList) {
    return null;
  }

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{currentList.name}</h1>
        <p className="text-gray-400">
          {incompleteTasks.length} offene Aufgaben
        </p>
      </header>

      <AddTask onAdd={handleAddTask} />

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400">
            Diese Liste ist noch leer. Fügen Sie Ihre erste Aufgabe hinzu!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleComplete}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>

          {completedTasks.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-gray-300 mb-4">
                Erledigt ({completedTasks.length})
              </h2>
              <div className="space-y-3 opacity-60">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleComplete}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
