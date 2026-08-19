import { useEffect, useState } from "react";
import React from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      setTitle("");
      await loadTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: editingTitle.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      );

      cancelEditing();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  );

  const renderTask = (task) => (
    <div className="task-card" key={task.id}>
      {editingId === task.id ? (
        <div className="edit-area">
          <input
            className="edit-input"
            type="text"
            value={editingTitle}
            onChange={(event) =>
              setEditingTitle(event.target.value)
            }
          />

          <button
            className="save-btn"
            type="button"
            onClick={() => saveEdit(task.id)}
          >
            Save
          </button>

          <button
            className="cancel-btn"
            type="button"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <div className="task-info">
            <span
              className={
                task.status === "completed"
                  ? "task-title completed"
                  : "task-title"
              }
            >
              {task.title}
            </span>

            <span className="task-id">
              Task #{task.id}
            </span>
          </div>

          <div className="task-actions">
            <button
              className={
                task.status === "completed"
                  ? "pending-btn"
                  : "complete-btn"
              }
              type="button"
              onClick={() => toggleTaskStatus(task)}
            >
              {task.status === "completed"
                ? "Mark Pending"
                : "Complete"}
            </button>

            <button
              className="edit-btn"
              type="button"
              onClick={() => startEditing(task)}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              type="button"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="app">
      <div className="container">

        {/* Header */}
        <header className="header">
          <div>
            <h1>DevOps Task Manager</h1>
            <p>Manage your tasks efficiently</p>
          </div>
        </header>

        {/* Add Task */}
        <form className="add-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "+ Add Task"}
          </button>
        </form>

        {/* Statistics */}
        <div className="stats">

          <div className="stat-card">
            <span className="stat-number">
              {tasks.length}
            </span>
            <span className="stat-label">
              Total Tasks
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {pendingTasks.length}
            </span>
            <span className="stat-label">
              Pending
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-number">
              {completedTasks.length}
            </span>
            <span className="stat-label">
              Completed
            </span>
          </div>

        </div>

        {/* Pending Tasks */}
        <section className="task-section">

          <div className="section-header">
            <h2>📋 Pending Tasks</h2>
            <span className="count">
              {pendingTasks.length}
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="empty-state">
              <p>No pending tasks 🎉</p>
            </div>
          ) : (
            pendingTasks.map(renderTask)
          )}

        </section>

        {/* Completed Tasks */}
        <section className="task-section">

          <div className="section-header">
            <h2>✅ Completed Tasks</h2>
            <span className="count completed-count">
              {completedTasks.length}
            </span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="empty-state">
              <p>No completed tasks yet.</p>
            </div>
          ) : (
            completedTasks.map(renderTask)
          )}

        </section>

        {/* Footer */}
        <footer>
          <p>DevOps Task Manager • Built with React + Node.js + MySQL</p>
        </footer>

      </div>
    </div>
  );
}

export default App;