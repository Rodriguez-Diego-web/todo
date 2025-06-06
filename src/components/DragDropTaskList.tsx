import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import type { Task } from '../types';

interface DragDropTaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onReorder: (newOrder: Task[]) => Promise<void>;
}

export function DragDropTaskList({
  tasks,
  onToggleComplete,
  onDelete,
  onReorder
}: DragDropTaskListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for all tasks
    const updatedTasks = items.map((task, index) => ({
      ...task,
      order: index
    }));

    onReorder(updatedTasks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2 p-4"
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id}
                index={index}
              >
                {(provided: DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-theme-secondary rounded-lg p-4 flex items-center gap-4"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleComplete(task.id)}
                      className="w-5 h-5 rounded border-theme-primary text-theme-primary focus:ring-theme-primary"
                    />
                    <div className="flex-1">
                      <h3 className={`text-theme-primary ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h3>
                      {task.notes && (
                        <p className="text-sm text-theme-secondary mt-1">
                          {task.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 hover:bg-theme-primary rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-theme-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 