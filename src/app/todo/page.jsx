"use client"
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Home() {
    // State for to-do list
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [editingTodo, setEditingTodo] = useState(null); // State for the todo being edited
    const [editedTodoName, setEditedTodoName] = useState(""); // State for edited name

    // Handle adding a new to-do and send it to database 
    const addTodo = async () => {
        if (newTodo.trim() === "") return; // Avoid adding empty to-dos
        const myTodo = {
            name: newTodo,
            isDone: false
        };
        const { data, error } = await supabase.from("Todo").insert([myTodo]).single();
        if (error) {
            console.log(error.message);
        } else {
            setTodos((prev) => [...prev, data]);
            setNewTodo(""); // Clear input field
        }
    };

    // Fetch all todos from the database 
    const fetchTodo = async () => {
        const { data, error } = await supabase.from("Todo").select("*");
        if (error) {
            console.log(error.message);
        } else {
            setTodos(data || []);
        }
    };

    useEffect(() => {
        fetchTodo();
    }, [newTodo]);

    // Handle deleting a todo
    const deleteTodo = async (id) => {
        const { error } = await supabase.from("Todo").delete().match({ id });
        if (error) {
            console.log(error.message);
        } else {
            setTodos((prev) => prev.filter((todo) => todo.id !== id)); // Remove the deleted todo from state
        }
    };

    // Handle opening the edit modal and setting the current todo
    const startEditing = (todo) => {
        setEditingTodo(todo);
        setEditedTodoName(todo.name); // Pre-fill the input with the current todo name
    };

    // Handle saving the edited todo
    const saveEditedTodo = async () => {
        if (editedTodoName.trim() === "") return; // Avoid saving empty todos
        const { data, error } = await supabase
            .from("Todo")
            .update({ name: editedTodoName })
            .match({ id: editingTodo.id })
            .single();

        if (error) {
            console.log(error.message);
        } else {
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === editingTodo.id ? { ...todo, name: editedTodoName } : todo
                )
            );
            setEditingTodo(null); // Close the modal
            setEditedTodoName(""); // Clear the edited name
        }
    };

    // Handle closing the edit modal
    const closeModal = () => {
        setEditingTodo(null);
        setEditedTodoName(""); // Clear the input field
    };

    const updateStatus = async (id, currentStatus) => {
        const newStatus = currentStatus ? false : true; // Toggle between true (Completed) and false (Pending)

        const { data, error } = await supabase
            .from("Todo")
            .update({ isDone: newStatus })
            .match({ id })
            .single();

        if (error) {
            console.log(error.message);
        } else {
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === id ? { ...todo, isDone: newStatus } : todo
                )
            );
        }
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                {/* Todo List Section */}
                <div className="w-full sm:w-2/3 md:w-full">
                    <h2 className="text-xl mb-4 font-extrabold">To-Do List</h2>

                    {/* Input field for new to-do */}
                    <input
                        type="text"
                        className="border p-2 rounded w-full"
                        placeholder="Add a new to-do"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                    />
                    <button
                        onClick={addTodo}
                        className="mt-2 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Todo
                    </button>

                    {/* List of to-dos */}
                    <ul className="mt-4 space-y-2">
                        {todos?.map((todo, index) => (
                            <li key={todo.id} className="flex justify-between items-center w-full">
                                <span>{index + 1}: {todo?.name}</span>
                                <div className="flex gap-2">
                                    {/* Edit and delete buttons */}
                                    <button
                                        onClick={() => startEditing(todo)}
                                        className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                    {/* Status Button (Toggle between Pending and Completed) */}
                                    <button
                                        onClick={() => updateStatus(todo.id, todo.isDone)}
                                        className={`p-2 rounded ${todo.isDone ? "bg-green-500" : "bg-gray-400"} text-white`}
                                    >
                                        {todo.isDone ? "Completed" : "Pending"}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            {/* Edit Todo Modal */}
            {editingTodo && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
                    <div className="bg-white p-6 rounded-lg w-80">
                        <h3 className="text-xl font-bold mb-4">Edit Todo</h3>
                        <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editedTodoName}
                            onChange={(e) => setEditedTodoName(e.target.value)}
                        />
                        <div className="mt-4 flex justify-between">
                            <button
                                onClick={saveEditedTodo}
                                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
