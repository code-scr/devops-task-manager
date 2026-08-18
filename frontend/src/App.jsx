import { useEffect, useState } from "react";
import React from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
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
      await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title
        })
      });

      setTitle("");
      await loadTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>DevOps Task Manager</h1>

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Enter a task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>

      <div className="tasks">
        {tasks.map((task) => (
          <div className="task" key={task.id}>
            <span>{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;