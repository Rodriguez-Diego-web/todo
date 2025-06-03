const express = require('express');
const cors = require('cors');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

async function readDB() {
  try {
    const data = await readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { lists: [], tasks: [] };
  }
}

async function writeDB(data) {
  await writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/lists', async (_req, res) => {
  const db = await readDB();
  res.json(db.lists);
});

app.post('/lists', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const newList = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const db = await readDB();
  db.lists.push(newList);
  await writeDB(db);
  res.status(201).json(newList);
});

app.get('/tasks', async (req, res) => {
  const db = await readDB();
  let tasks = db.tasks;
  if (req.query.listId) {
    tasks = tasks.filter(t => t.listId === req.query.listId);
  }
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const { title, listId, notes, dueDate, priority } = req.body;
  if (!title || !listId) return res.status(400).json({ error: 'title and listId required' });
  const newTask = {
    id: uuidv4(),
    listId,
    title,
    notes,
    dueDate,
    priority: priority || 0,
    completed: false,
    updatedAt: new Date().toISOString(),
  };
  const db = await readDB();
  db.tasks.push(newTask);
  await writeDB(db);
  res.status(201).json(newTask);
});

app.patch('/tasks/:id', async (req, res) => {
  const db = await readDB();
  const idx = db.tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'task not found' });
  const task = db.tasks[idx];
  const updatedTask = { ...task, ...req.body, updatedAt: new Date().toISOString() };
  db.tasks[idx] = updatedTask;
  await writeDB(db);
  res.json(updatedTask);
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
