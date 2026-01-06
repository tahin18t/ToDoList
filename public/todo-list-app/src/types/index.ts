export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoFormProps {
  onAddTodo: (todo: Todo) => void;
}

export interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}