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

app.listen(PORT, () => {
  console.log(`Task Manager API running on port ${PORT}`);
});