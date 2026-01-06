import React from 'react';
import TodoList from '../components/TodoList';
import TodoForm from '../components/TodoForm';
import useTodos from '../hooks/useTodos';

const Home: React.FC = () => {
    const { todos, addTodo, deleteTodo, toggleTodo } = useTodos();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">To Do List</h1>
            <TodoForm addTodo={addTodo} />
            <TodoList todos={todos} deleteTodo={deleteTodo} toggleTodo={toggleTodo} />
        </div>
    );
};

export default Home;