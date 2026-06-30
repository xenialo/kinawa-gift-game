const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// In-memory store, persisted to data.json on every write
let store = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
} catch (e) {
  store = {};
}

function persist() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(store)); } catch (e) {}
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/get/:key', (req, res) => {
  const val = store[req.params.key] ?? null;
  res.json({ value: val });
});

app.post('/api/set/:key', (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'missing value' });
  store[req.params.key] = value;
  persist();
  res.json({ ok: true });
});

app.get('/api/list/:prefix', (req, res) => {
  const prefix = req.params.prefix;
  const keys = Object.keys(store).filter(k => k.startsWith(prefix));
  res.json({ keys });
});

app.delete('/api/reset', (req, res) => {
  Object.keys(store).forEach(k => { if (k.startsWith('oka26-')) delete store[k]; });
  persist();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
