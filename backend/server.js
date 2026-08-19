const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5
});

async function initializeDatabase() {
  try {
    const [columns] = await db.query(`
      SHOW COLUMNS FROM tasks LIKE 'status'
    `);

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE tasks
        ADD COLUMN status
        ENUM('pending', 'completed')
        NOT NULL DEFAULT 'pending'
      `);

      console.log("Status column added successfully");
    } else {
      console.log("Status column already exists");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch tasks"
    });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Title is required"
      });
    }

    const [result] = await db.query(
      "INSERT INTO tasks (title) VALUES (?)",
      [title]
    );

    res.status(201).json({
      id: result.insertId,
      title
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create task"
    });
  }
});

app.patch("/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status"
      });
    }

    const [result] = await db.query(
      "UPDATE tasks SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("STATUS ERROR:", error);

    res.status(500).json({
      error: "Failed to update task status"
    });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Title is required"
      });
    }

    const [result] = await db.query(
      "UPDATE tasks SET title = ? WHERE id = ?",
      [title.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("EDIT ERROR:", error);

    res.status(500).json({
      error: "Failed to update task"
    });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    res.status(500).json({
      error: "Failed to delete task"
    });
  }
});

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Task Manager API running on port ${PORT}`);
  });
}

startServer();