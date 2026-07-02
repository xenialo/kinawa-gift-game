const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=minimal'
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/get/:key', async (req, res) => {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/store?key=eq.${encodeURIComponent(req.params.key)}&select=value`,
    { headers: sbHeaders() }
  );
  const rows = await r.json();
  res.json({ value: rows.length ? rows[0].value : null });
});

app.post('/api/set/:key', async (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'missing value' });
  await fetch(`${SUPABASE_URL}/rest/v1/store`, {
    method: 'POST',
    headers: { ...sbHeaders(), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key: req.params.key, value })
  });
  res.json({ ok: true });
});

app.get('/api/list/:prefix', async (req, res) => {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/store?key=like.${encodeURIComponent(req.params.prefix + '%')}&select=key`,
    { headers: sbHeaders() }
  );
  const rows = await r.json();
  res.json({ keys: rows.map(r => r.key) });
});

app.delete('/api/reset', async (req, res) => {
  await fetch(
    `${SUPABASE_URL}/rest/v1/store?key=like.oka26-%25`,
    { method: 'DELETE', headers: sbHeaders() }
  );
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
