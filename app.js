const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (for demo only)
let todos = [];
let nextId = 1;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Logger middleware (useful for Jenkins logs)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// GET all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// CREATE todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const todo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// TOGGLE todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const todo = todos.find(t => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todo.completed = !todo.completed;
  res.json(todo);
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);
  res.json({ message: 'Todo deleted successfully' });
});

// HEALTH CHECK (important for Jenkins/DevOps)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    todos: todos.length,
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export app (for testing/Jenkins pipelines)
module.exports = app;

// Start server only if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Todo app running on port ${PORT}`);
  });
}
