export interface Task {
  id: string;            // UUID
  listId: string;
  title: string;
  notes?: string;
  dueDate?: string;      // ISO 8601
  priority: 0 | 1 | 2;   // 0=Low,1=Medium,2=High
  completed: boolean;
  updatedAt: string;
}

export interface List {
  id: string;            // UUID
  name: string;
  createdAt: string;
  updatedAt: string;
}
