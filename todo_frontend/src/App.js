import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App
 * A modern, light-themed Todo application UI implementing:
 * - View todo list
 * - Add todo
 * - Edit todo
 * - Delete todo
 * - Mark todos as complete
 * - Filter by status (All, Active, Completed)
 *
 * Data persistence uses localStorage to mimic a local database integration.
 */
function App() {
  // Persistent state via localStorage
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem('todos');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Persist todos on change
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch {
      // Ignore storage write errors
    }
  }, [todos]);

  // Derived filtered list
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  /**
   * PUBLIC_INTERFACE
   * generateId
   * Generate a simple unique-ish id for todos.
   */
  const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  /**
   * PUBLIC_INTERFACE
   * addTodo
   * Add a new todo item with the provided text.
   */
  const addTodo = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return; // do not add empty items
    const newTodo = {
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setNewTask('');
  };

  /**
   * PUBLIC_INTERFACE
   * updateTodo
   * Update an existing todo's text by id.
   */
  const updateTodo = (id, newText) => {
    const trimmed = (newText || '').trim();
    if (!trimmed) return;
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text: trimmed } : t)));
    setEditingId(null);
    setEditingText('');
  };

  /**
   * PUBLIC_INTERFACE
   * deleteTodo
   * Remove a todo by id.
   */
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText('');
    }
  };

  /**
   * PUBLIC_INTERFACE
   * toggleComplete
   * Toggle completion state for a given todo id.
   */
  const toggleComplete = (id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    addTodo(newTask);
  };

  const startEdit = (id, currentText) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // PUBLIC_INTERFACE
  const setFilterSafe = (value) => {
    /** Set the current filter: "all" | "active" | "completed" */
    setFilter(value);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="container">
          <h1 className="title">Daily Task Organizer</h1>
          <p className="subtitle">Stay on top of your day with a clean, modern todo list.</p>
        </div>
      </header>

      <main className="container">
        <section className="todo-panel">
          <form className="todo-form" onSubmit={onSubmit} aria-label="Add new task form">
            <input
              type="text"
              className="todo-input"
              placeholder="Add a new task"
              aria-label="New task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addTodo(newTask);
                }
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              aria-label="Add task"
              disabled={!newTask.trim()}
              title="Add task"
            >
              Add
            </button>
          </form>

          <div className="filters" role="tablist" aria-label="Filter todos by status">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilterSafe('all')}
              aria-pressed={filter === 'all'}
              role="tab"
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilterSafe('active')}
              aria-pressed={filter === 'active'}
              role="tab"
            >
              Active
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterSafe('completed')}
              aria-pressed={filter === 'completed'}
              role="tab"
            >
              Completed
            </button>
          </div>

          <ul className="todo-list" aria-live="polite">
            {filteredTodos.length === 0 && (
              <li className="empty-state">
                <div className="empty-card">
                  <div className="empty-icon" aria-hidden="true">🗒️</div>
                  <div>No tasks here yet.</div>
                  <div className="hint">Add your first task above to get started.</div>
                </div>
              </li>
            )}

            {filteredTodos.map(todo => {
              const isEditing = editingId === todo.id;
              return (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  <div className="left">
                    <input
                      type="checkbox"
                      className="todo-check"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                      aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
                    />

                    {!isEditing && (
                      <span className="todo-text" title={todo.text}>
                        {todo.text}
                      </span>
                    )}

                    {isEditing && (
                      <input
                        className="edit-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        aria-label="Edit task"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            updateTodo(todo.id, editingText);
                          } else if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                      />
                    )}
                  </div>

                  <div className="actions">
                    {!isEditing && (
                      <>
                        <button
                          className="icon-btn"
                          onClick={() => startEdit(todo.id, todo.text)}
                          aria-label="Edit task"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-btn danger"
                          onClick={() => deleteTodo(todo.id)}
                          aria-label="Delete task"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <button
                          className="btn btn-accent btn-small"
                          onClick={() => updateTodo(todo.id, editingText)}
                          aria-label="Save changes"
                          title="Save"
                          disabled={!editingText.trim()}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={cancelEdit}
                          aria-label="Cancel editing"
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="container footer">
        <span className="small-muted">
          {todos.filter(t => !t.completed).length} remaining • {todos.filter(t => t.completed).length} completed
        </span>
      </footer>
    </div>
  );
}

export default App;
