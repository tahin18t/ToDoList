import React, { useState } from 'react';

const TodoForm: React.FC<{ addTodo: (todo: string) => void }> = ({ addTodo }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            addTodo(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center justify-between p-4 bg-white shadow-md rounded">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new todo"
                className="flex-grow p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Add
            </button>
        </form>
    );
};

export default TodoForm;