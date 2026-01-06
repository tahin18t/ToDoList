import { useState, useEffect } from 'react';
import { Todo } from '../types';

const useTodos = () => {
    const [todos, setTodos] = useState<Todo[]>([]);

    useEffect(() => {
        const fetchTodos = async () => {
            // Simulate fetching todos from an API
            const response = await fetch('/api/todos');
            const data = await response.json();
            setTodos(data);
        };

        fetchTodos();
    }, []);

    const addTodo = async (newTodo: Todo) => {
        // Simulate adding a new todo
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTodo),
        });
        const addedTodo = await response.json();
        setTodos((prevTodos) => [...prevTodos, addedTodo]);
    };

    const deleteTodo = async (id: string) => {
        // Simulate deleting a todo
        await fetch(`/api/todos/${id}`, {
            method: 'DELETE',
        });
        setTodos((prevTodos) => prevTodos.filter(todo => todo.id !== id));
    };

    return { todos, addTodo, deleteTodo };
};

export default useTodos;