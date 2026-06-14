import cors from "cors"
import express from "express"
import Database from "better-sqlite3"

const app = express()
const sqliteDb = new Database("ticket_new.sqlite")

app.use(cors())
app.use(express.json())

// =============================================
// STATUS
// =============================================

// GET tous les status
app.get("/status", (req, res) => {
  const rows = sqliteDb.prepare("SELECT * FROM t_status").all()
  res.json(rows)
})

// POST créer un status (+ entrée dans settings)
app.post("/tickets/status", (req, res) => {
  const { name } = req.body
  sqliteDb.prepare("INSERT OR IGNORE INTO t_status(name) VALUES (?)").run(name)
  const status = sqliteDb.prepare("SELECT * FROM t_status WHERE name = ?").get(name)
  sqliteDb.prepare(`
    INSERT OR IGNORE INTO settings(status_id, color, label)
    VALUES (?, '#3498db', ?)
  `).run(status.id, status.name)
  res.json(status)
})

// =============================================
// PRIORITY
// =============================================

// GET toutes les priorités
app.get("/priorities", (req, res) => {
  const rows = sqliteDb.prepare("SELECT * FROM t_priority").all()
  res.json(rows)
})

// POST créer une priorité
app.post("/tickets/priority", (req, res) => {
  const { name } = req.body
  sqliteDb.prepare("INSERT OR IGNORE INTO t_priority(name) VALUES (?)").run(name)
  const priority = sqliteDb.prepare("SELECT * FROM t_priority WHERE name = ?").get(name)
  res.json(priority)
})

// =============================================
// TICKETS — CRUD COMPLET
// =============================================

// GET tous les tickets (avec status_name et priority_name)
app.get("/tickets", (req, res) => {
  const tickets = sqliteDb.prepare(`
    SELECT t.*, s.name as status_name, p.name as priority_name
    FROM tickets t
    JOIN t_status s ON t.status_id = s.id
    JOIN t_priority p ON t.priority_id = p.id
  `).all()
  res.json(tickets)
})

// GET un ticket par id
app.get("/tickets/:id", (req, res) => {
  const ticket = sqliteDb.prepare(`
    SELECT t.*, s.name as status_name, p.name as priority_name
    FROM tickets t
    JOIN t_status s ON t.status_id = s.id
    JOIN t_priority p ON t.priority_id = p.id
    WHERE t.id = ?
  `).get(req.params.id)
  res.json(ticket)
})

// POST créer un ticket
app.post("/tickets", (req, res) => {
  const { num_ticket, date, heure, titre, description, status_id, priority_id, items } = req.body
  const result = sqliteDb.prepare(`
    INSERT INTO tickets (num_ticket, date, heure, titre, description, status_id, priority_id, items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(num_ticket, date, heure, titre, description, status_id, priority_id, items)
  res.json({ success: true, id: result.lastInsertRowid })
})

// PUT modifier un ticket (titre, description, status, priority)
app.put("/tickets/:id", (req, res) => {
  const { titre, description, status_id, priority_id } = req.body
  sqliteDb.prepare(`
    UPDATE tickets
    SET titre = ?, description = ?, status_id = ?, priority_id = ?
    WHERE id = ?
  `).run(titre, description, status_id, priority_id, req.params.id)
  res.json({ success: true })
})

// PUT modifier uniquement le status d'un ticket (drag & drop kanban)
app.put("/tickets/:id/status", (req, res) => {
  const { status_id, titre, description } = req.body
  sqliteDb.prepare(`
    UPDATE tickets
    SET status_id = ?, titre = ?, description = ?
    WHERE id = ?
  `).run(status_id, titre, description, req.params.id)
  res.json({ success: true })
})

// DELETE supprimer un ticket
app.delete("/tickets/:id", (req, res) => {
  sqliteDb.prepare("DELETE FROM tickets WHERE id = ?").run(req.params.id)
  res.json({ success: true })
})

// =============================================
// DASHBOARD
// =============================================

// GET total tickets + détail par status
app.get("/tickets/dashboard", (req, res) => {
  const total = sqliteDb.prepare("SELECT COUNT(*) as total FROM tickets").get()
  const details = sqliteDb.prepare(`
    SELECT s.name as status, COUNT(*) as total
    FROM tickets t
    JOIN t_status s ON t.status_id = s.id
    GROUP BY s.name
  `).all()
  res.json({ total: total.total, details })
})

// =============================================
// SETTINGS (couleurs + labels kanban)
// =============================================

// GET tous les settings avec status_name
app.get("/settings", (req, res) => {
  const settings = sqliteDb.prepare(`
    SELECT s.*, t.name as status_name
    FROM settings s
    JOIN t_status t ON s.status_id = t.id
    ORDER BY s.status_id
  `).all()
  res.json(settings)
})

// PUT modifier les settings (array)
app.put("/settings", (req, res) => {
  const settings = req.body
  const stmt = sqliteDb.prepare(`
    UPDATE settings SET color = ?, label = ? WHERE status_id = ?
  `)
  for (const setting of settings) {
    stmt.run(setting.color, setting.label, setting.status_id)
  }
  res.json({ success: true })
})

// =============================================
// TEST SQLITE
// =============================================

app.get("/tickets/test", (req, res) => {
  try {
    sqliteDb.prepare("SELECT 1").get()
    res.json({ success: true, message: "SQLite OK" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// =============================================
// START
// =============================================

app.listen(3099, () => {
  console.log("[server] http://localhost:3099")
})