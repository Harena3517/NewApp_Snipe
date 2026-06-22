import cors from "cors"
import express from "express"
import db from "./mysql.js"
import sqliteDb from "./sqlite.js"

const app = express()
app.use(cors())
app.use(express.json())
const tablesToReset = [
  "components_assets",
  "consumables_users",
  "accessories_checkout",
  "license_seats",

  "kits_accessories",
  "kits_consumables",
  "kits_licenses",
  "kits_models",

  "action_logs",
  "asset_logs",
  "asset_uploads",

  "maintenances",

  "checkout_acceptances",
  "checkout_requests",
  "requested_assets",

  "components",
  "consumables",
  "accessories",
  "licenses",
  "assets",
  "kits",

  "models",
  "manufacturers",
  "companies",
  "departments",
  "status_labels",

  "locations",
  "suppliers",

  "categories"
]

/* =====================================
   TEST SQLITE
===================================== */

app.get("/tickets/test", (req, res) => {
  try {
    sqliteDb.prepare("SELECT 1").get()
    res.json({
      success: true,
      message: "SQLite OK"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

/* =====================================
   STATUS
===================================== */
app.post("/tickets/status", (req, res) => {
  const { name } = req.body
  const result = sqliteDb.prepare(`
    INSERT OR IGNORE INTO t_status(name)
    VALUES (?)
  `).run(name)
  const status = sqliteDb.prepare(`
    SELECT *
    FROM t_status
    WHERE name = ?
  `).get(name)
  sqliteDb.prepare(`
    INSERT OR IGNORE INTO settings(
      status_id,
      color,
      label
    )
    VALUES (?, '#3498db', ?)
  `).run(
    status.id,
    status.name
  )
  res.json(status)
})

/* =====================================
   PRIORITY
===================================== */

app.post("/tickets/priority", (req, res) => {
  try {
    const { name } = req.body
    sqliteDb.prepare(`
      INSERT OR IGNORE INTO t_priority(name)
      VALUES (?)
    `).run(name)
    const priority =
      sqliteDb.prepare(`
        SELECT *
        FROM t_priority
        WHERE name = ?
      `).get(name)
    res.json(priority)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})
/* =====================================
   TICKETS
===================================== */
app.put("/tickets/:id/status", (req, res) => {
    const id = req.params.id
    const { status_id, titre, description } = req.body
    sqliteDb.prepare(`
      UPDATE tickets
      SET
        status_id = ?,
        titre = ?,
        description = ?
      WHERE id = ?
    `).run(
      status_id,
      titre,
      description,
      id
    )
    res.json({
      success: true
    })
})
app.post("/tickets", (req, res) => {
  try {
    const ticket = req.body
    const result =
      sqliteDb.prepare(`
        INSERT INTO tickets (
          num_ticket,
          date,
          heure,
          titre,
          description,
          status_id,
          priority_id,
          items
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        ticket.num_ticket,
        ticket.date,
        ticket.heure,
        ticket.titre,
        ticket.description,
        ticket.status_id,
        ticket.priority_id,
        ticket.items
      )
    res.json({
      success: true,
      id: result.lastInsertRowid
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})
app.get("/tickets/dashboard", (req, res) => {
  const total =
    sqliteDb.prepare(`
      SELECT COUNT(*) as total
      FROM tickets
    `).get()
  const details =
    sqliteDb.prepare(`
SELECT
  s.name as status,
  COUNT(*) as total
FROM tickets t
JOIN t_status s
  ON t.status_id = s.id
GROUP BY s.name
    `).all()
  res.json({
    total: total.total,
    details
  })
})
app.get("/ticket-cost", (req, res) => {
  try {
    const rows = sqliteDb.prepare(`
      SELECT
        category_name,
        SUM(CASE WHEN type = 'cout_saisie' THEN montant ELSE 0 END) as cout_saisie,
        SUM(CASE WHEN type = 'reouverture' THEN montant ELSE 0 END) as reouverture,
        SUM(montant) as total
      FROM montant_tickets
      GROUP BY category_name
    `).all()
    res.json(rows)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})
app.delete("/tickets/:id", (req, res) => {
  const id = req.params.id
  sqliteDb.prepare(`
    DELETE FROM ticket_history
    WHERE ticket_id = ?
  `).run(id)
  sqliteDb.prepare(`
    DELETE FROM montant_tickets
    WHERE ticket_id = ?
  `).run(id)
  sqliteDb.prepare(`
    DELETE FROM tickets
    WHERE id = ?
  `).run(id)
  res.json({ success: true })
})
app.put("/tickets/:id", (req, res) => {

  const {
    titre,
    description,
    status_id,
    priority_id,
    date
  } = req.body

  const result = sqliteDb.prepare(`
    UPDATE tickets
    SET
      titre = ?,
      description = ?,
      status_id = ?,
      priority_id = ?,
      date = ?
    WHERE id = ?
  `).run(
    titre,
    description,
    status_id,
    priority_id,
    date,
    req.params.id
  )
  console.log("Lignes modifiées :", result.changes)
  const ticket = sqliteDb.prepare(`
    SELECT *
    FROM tickets
    WHERE id = ?
  `).get(req.params.id)
  console.log("Ticket après update :", ticket)
  res.json({ success: true })
})

app.get("/tickets/:id", (req, res) => {
  const id = req.params.id
  const ticket = sqliteDb.prepare(`
    SELECT
      t.*,
      s.name AS status_name,
      p.name AS priority_name
    FROM tickets t
    JOIN t_status s
      ON t.status_id = s.id
    JOIN t_priority p
      ON t.priority_id = p.id
    WHERE t.id = ?
  `).get(id)
  res.json(ticket)
})
app.get("/settings", (req, res) => {
  const settings = sqliteDb.prepare(`
    SELECT *
    FROM settings
    ORDER BY status_id
  `).all()
  res.json(settings)
})

app.put("/settings", (req, res) => {
  const settings = req.body
  const stmt = sqliteDb.prepare(`
    UPDATE settings
    SET
      color = ?,
      label = ?
    WHERE status_id = ?
  `)
  for (const setting of settings) {
    stmt.run(
      setting.color,
      setting.label,
      setting.status_id
    )
  }
  res.json({
    success: true
  })
})
app.put("/settings/:id", (req, res) => {
  const { id } = req.params;
  const { color, label } = req.body;
  const stmt = sqliteDb.prepare(`
    UPDATE settings
    SET
      color = ?,
      label = ?
    WHERE status_id = ?
  `);
  const result = stmt.run(color, label, id);
  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      message: "Setting introuvable"
    });
  }
  res.json({
    success: true,
    message: "Setting mis à jour"
  });
});
app.get("/tickets", (req, res) => {
  const tickets = sqliteDb.prepare(`
    SELECT t.*, s.name as status_name, p.name as priority_name
    FROM tickets t
    JOIN t_status s ON t.status_id = s.id
    JOIN t_priority p ON t.priority_id = p.id
  `).all()
  res.json(tickets)
})
app.get("/status", (req, res) => {
  const rows = sqliteDb.prepare("SELECT * FROM t_status").all()
  res.json(rows)
})

app.get("/priorities", (req, res) => {
  const rows = sqliteDb.prepare("SELECT * FROM t_priority").all()
  res.json(rows)
})
app.post("/ticket-history", (req, res) => {
  const {
    ticket_id,
    status_id,
    date_time
  } = req.body
  const result = sqliteDb.prepare(`
    INSERT INTO ticket_history (
      ticket_id,
      status_id,
      date_time
    )
    VALUES (?, ?, ?)
  `).run(
    ticket_id,
    status_id,
    date_time
  )

  res.json({
    success: true,
    id: result.lastInsertRowid
  })
})
app.get("/ticket-history", (req, res) => {
  const history = sqliteDb.prepare(`
    SELECT
      h.id,
      h.date_time,
      t.titre,
      s.name AS status_name
    FROM ticket_history h
    JOIN tickets t
      ON h.ticket_id = t.id
    JOIN t_status s
      ON h.status_id = s.id
    ORDER BY h.date_time DESC
  `).all()

  res.json(history)
 
})
app.post("/ticket-cost", (req, res) => {
  const { ticket_id, montant, category_name, groupe_id, type } = req.body
  const timestamp = Date.now()
  sqliteDb.prepare(`
    INSERT INTO montant_tickets (ticket_id, montant, category_name, groupe_id, type, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(ticket_id, montant, category_name, groupe_id, type, timestamp)
  res.json({ success: true })
})
app.delete("/ticket-cost/last/:ticket_id", (req, res) => {
  const ticket_id = req.params.ticket_id

  // Trouver le timestamp max de type cout_saisie
  const lastGroup = sqliteDb.prepare(`
    SELECT groupe_id FROM montant_tickets
    WHERE ticket_id = ? AND type = 'cout_saisie'
    ORDER BY timestamp DESC
    LIMIT 1
  `).get(ticket_id)

  if (!lastGroup) return res.json({ success: true })

  const result = sqliteDb.prepare(`
    DELETE FROM montant_tickets
    WHERE groupe_id = ?
  `).run(lastGroup.groupe_id)

  res.json({ success: true, deleted: result.changes })
})
console.log("TICKETS:", sqliteDb.prepare("SELECT * FROM tickets").all())
console.log("MONTANTS:", sqliteDb.prepare("SELECT * FROM montant_tickets").all())
app.get("/ticket-cost-by-ticket", (req, res) => {
  const rows = sqliteDb.prepare(`
  SELECT
  m.ticket_id,
  t.num_ticket,
  t.titre,
  SUM(CASE WHEN m.type = 'cout_saisie' THEN m.montant ELSE 0 END) as cout_saisie,
  SUM(CASE WHEN m.type = 'reouverture' THEN m.montant ELSE 0 END) as reouverture,
  SUM(m.montant) as total
  FROM montant_tickets m
  JOIN tickets t ON t.id = m.ticket_id
  GROUP BY m.ticket_id
  `).all()
  res.json(rows)
})
app.get("/ticket-cost-detail", (req, res) => {
  const rows = sqliteDb.prepare(`
    SELECT
      m.ticket_id,
      t.num_ticket,
      t.titre,
      t.items,
      m.category_name,
      m.montant,
      m.type
    FROM montant_tickets m
    JOIN tickets t ON t.id = m.ticket_id
    ORDER BY t.num_ticket
  `).all()

  rows.forEach(r => {
    r.assets = JSON.parse(r.items)
  })

  res.json(rows)
})
// app.post("/import-tickets", (req, res) => {
//   try {
//     const rows = req.body

//     for (const row of rows) {
//       const ticket = sqliteDb.prepare(
//         "SELECT * FROM tickets WHERE num_ticket = ?"
//       ).get(Number(row.num_ticket))

//       if (!ticket) continue

//       const mvt = (row.mvt || "").toLowerCase().trim()
//       const isClosed  = mvt === "closed" || mvt === "close"
//       const isOpen    = mvt === "open" || mvt === "reouverture"
//       const isAnnule  = mvt === "annule" || mvt === "cancel"
//       const categoryName = row.category_name || "Inconnu"
//       const groupeId = Date.now().toString() + ticket.id

//       if (isClosed) {
//         sqliteDb.prepare("UPDATE tickets SET status_id = 3 WHERE id = ?").run(ticket.id)

//         if (Number(row.montant) > 0) {
//           sqliteDb.prepare(`
//             INSERT INTO montant_tickets (ticket_id, montant, category_name, groupe_id, type, timestamp)
//             VALUES (?, ?, ?, ?, 'cout_saisie', ?)
//           `).run(ticket.id, Number(row.montant), categoryName, groupeId, Date.now())
//         }

//         sqliteDb.prepare(
//           "INSERT INTO ticket_history (ticket_id, status_id, date_time) VALUES (?, 3, ?)"
//         ).run(ticket.id, new Date().toISOString())

//       } else if (isOpen) {
//         sqliteDb.prepare("UPDATE tickets SET status_id = 2 WHERE id = ?").run(ticket.id)

//         if (Number(row.montant) > 0) {
//           sqliteDb.prepare(`
//             INSERT INTO montant_tickets (ticket_id, montant, category_name, groupe_id, type, timestamp)
//             VALUES (?, ?, ?, ?, 'reouverture', ?)
//           `).run(ticket.id, Number(row.montant), categoryName, groupeId, Date.now())
//         }

//         sqliteDb.prepare(
//           "INSERT INTO ticket_history (ticket_id, status_id, date_time) VALUES (?, 2, ?)"
//         ).run(ticket.id, new Date().toISOString())

//       } else if (isAnnule) {
//         // Retour inprogress
//         sqliteDb.prepare("UPDATE tickets SET status_id = 2 WHERE id = ?").run(ticket.id)

//         // Supprimer dernier cout_saisie de CE ticket
//         const lastGroup = sqliteDb.prepare(`
//           SELECT groupe_id FROM montant_tickets
//           WHERE ticket_id = ? AND type = 'cout_saisie'
//           ORDER BY timestamp DESC LIMIT 1
//         `).get(ticket.id)

//         if (lastGroup) {
//           sqliteDb.prepare(
//             "DELETE FROM montant_tickets WHERE groupe_id = ?"
//           ).run(lastGroup.groupe_id)
//         }

//         sqliteDb.prepare(
//           "INSERT INTO ticket_history (ticket_id, status_id, date_time) VALUES (?, 2, ?)"
//         ).run(ticket.id, new Date().toISOString())
//       }
//     }

//     res.json({ success: true })
//   } catch (err) {
//     console.error("Erreur import", err)
//     res.status(500).json({ error: err.message })
//   }
// })

// app.get("/hardware/count", async (req, res) => {

//   const connection = await db.getConnection()

//   try {

//     const [rows] = await connection.query(`
//       SELECT COUNT(*) AS total
//       FROM assets
//     `)

//     res.json({
//       total: rows[0].total
//     })

//   } finally {

//     connection.release()

//   }
// })
/* =====================================
   RESET MYSQL + SQLITE
===================================== */
app.get("/reset-data", async (req, res) => {
  const connection = await db.getConnection()
  try {
    const results = []
    await connection.beginTransaction()
    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    )
    // USERS
    try {
      await connection.query(`
        DELETE FROM users_groups
        WHERE user_id != 1
      `)
    } catch {}
    try {
      const [usersResult] =
        await connection.query(`
          DELETE FROM users
          WHERE id != 1
        `)
      results.push({
        table: "users",
        deleted: usersResult.affectedRows
      })
    } catch {}
    try {
      await connection.query(
        "DELETE FROM login_attempts"
      )
    } catch {}
    // TABLES MYSQL
    for (const table of tablesToReset) {
      try {
        const [result] =
          await connection.query(
            `DELETE FROM ${table}`
          )
        try {
          await connection.query(
            `ALTER TABLE ${table} AUTO_INCREMENT = 1`
          )
        } catch {}
        results.push({
          table,
          deleted: result.affectedRows
        })
      } catch (err) {
        console.error(
          table,
          err.message
        )
      }
    }


sqliteDb.prepare("DELETE FROM montant_tickets").run()
sqliteDb.prepare("DELETE FROM ticket_history").run()
sqliteDb.prepare("DELETE FROM settings").run()
sqliteDb.prepare("DELETE FROM tickets").run()
sqliteDb.prepare("DELETE FROM t_status").run()
sqliteDb.prepare("DELETE FROM t_priority").run()
sqliteDb.prepare(`
  DELETE FROM sqlite_sequence
  WHERE name IN (
    'montant_tickets',
    'ticket_history',
    'settings',
    'tickets',
    't_status',
    't_priority'
  )
`).run()
    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 1"
    )
    await connection.commit()
    res.json({
      success: true,
      message: "Reset terminé",
      results: results
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({
      success: false,
      message: error.message
    })
  } finally {
    connection.release()
  }
})
app.listen(3099, () => {
  console.log(
    "[reset-server] http://localhost:3099"
  )
})