import cors from "cors"
import express from "express"
import db from "./mysql.js"
import sqliteDb from "./sqlite.js"

const app = express()
<<<<<<< HEAD
app.use(cors())
app.use(express.json())
const tablesToReset = [
=======

app.use(cors())
app.use(express.json())

const tablesToReset = [

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
  try {
    sqliteDb.prepare("SELECT 1").get()
=======

  try {

    sqliteDb.prepare("SELECT 1").get()

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.json({
      success: true,
      message: "SQLite OK"
    })
<<<<<<< HEAD
  } catch (error) {
=======

  } catch (error) {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

/* =====================================
   STATUS
===================================== */
<<<<<<< HEAD
app.post("/tickets/status", (req, res) => {
  const { name } = req.body
=======

app.post("/tickets/status", (req, res) => {

  const { name } = req.body

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const result = sqliteDb.prepare(`
    INSERT OR IGNORE INTO t_status(name)
    VALUES (?)
  `).run(name)
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const status = sqliteDb.prepare(`
    SELECT *
    FROM t_status
    WHERE name = ?
  `).get(name)
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  res.json(status)
})

/* =====================================
   PRIORITY
===================================== */

app.post("/tickets/priority", (req, res) => {
<<<<<<< HEAD
  try {
    const { name } = req.body
=======

  try {

    const { name } = req.body

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    sqliteDb.prepare(`
      INSERT OR IGNORE INTO t_priority(name)
      VALUES (?)
    `).run(name)
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    const priority =
      sqliteDb.prepare(`
        SELECT *
        FROM t_priority
        WHERE name = ?
      `).get(name)
<<<<<<< HEAD
    res.json(priority)
  } catch (error) {
=======

    res.json(priority)

  } catch (error) {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})
/* =====================================
   TICKETS
===================================== */
<<<<<<< HEAD
app.put("/tickets/:id/status", (req, res) => {
    const id = req.params.id
    const { status_id, titre, description } = req.body
=======
app.put(
  "/tickets/:id/status",
  (req, res) => {
    const id = req.params.id
    const {
      status_id,
      titre,
      description
    } = req.body
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.json({
      success: true
    })
})
app.post("/tickets", (req, res) => {
<<<<<<< HEAD
  try {
    const ticket = req.body
=======

  try {

    const ticket = req.body

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.json({
      success: true,
      id: result.lastInsertRowid
    })
<<<<<<< HEAD
  } catch (error) {
=======

  } catch (error) {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})
app.get("/tickets/dashboard", (req, res) => {
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const total =
    sqliteDb.prepare(`
      SELECT COUNT(*) as total
      FROM tickets
    `).get()
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  res.json({
    total: total.total,
    details
  })
})
<<<<<<< HEAD
app.get("/ticket-cost", async (req, res) => {
  try {
    const rows = sqliteDb.prepare(`
      SELECT
        category_name,
        SUM(montant) as total
      FROM montant_tickets
      GROUP BY category_name
    `).all()
    console.log("COST ROWS =>", rows)
    res.json(rows)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})
app.delete("/tickets/:id", (req, res) => {
  const id = req.params.id
=======
app.delete("/tickets/:id", (req, res) => {

  const id = req.params.id

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  sqliteDb.prepare(`
    DELETE FROM tickets
    WHERE id = ?
  `).run(id)
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  res.json({
    success: true
  })

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
<<<<<<< HEAD
  console.log("Lignes modifiées :", result.changes)
=======

  console.log("Lignes modifiées :", result.changes)

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const ticket = sqliteDb.prepare(`
    SELECT *
    FROM tickets
    WHERE id = ?
  `).get(req.params.id)
<<<<<<< HEAD
  console.log("Ticket après update :", ticket)
=======

  console.log("Ticket après update :", ticket)

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  res.json({ success: true })
})

app.get("/tickets/:id", (req, res) => {
<<<<<<< HEAD
  const id = req.params.id
=======

  const id = req.params.id

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
  res.json(ticket)
})
app.get("/settings", (req, res) => {
=======

  res.json(ticket)

})
app.get("/settings", (req, res) => {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const settings = sqliteDb.prepare(`
    SELECT *
    FROM settings
    ORDER BY status_id
  `).all()
<<<<<<< HEAD
  res.json(settings)
})

app.put("/settings", (req, res) => {
  const settings = req.body
=======

  res.json(settings)

})
app.put("/settings", (req, res) => {

  const settings = req.body

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const stmt = sqliteDb.prepare(`
    UPDATE settings
    SET
      color = ?,
      label = ?
    WHERE status_id = ?
  `)
<<<<<<< HEAD
  for (const setting of settings) {
=======

  for (const setting of settings) {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    stmt.run(
      setting.color,
      setting.label,
      setting.status_id
    )
<<<<<<< HEAD
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
=======

  }

  res.json({
    success: true
  })

})
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const {
    ticket_id,
    status_id,
    date_time
  } = req.body
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  const history = sqliteDb.prepare(`
    SELECT
      h.id,
      h.date_time,
      t.titre,
      s.name AS status_name
<<<<<<< HEAD
    FROM ticket_history h
    JOIN tickets t
      ON h.ticket_id = t.id
    JOIN t_status s
      ON h.status_id = s.id
=======

    FROM ticket_history h

    JOIN tickets t
      ON h.ticket_id = t.id

    JOIN t_status s
      ON h.status_id = s.id

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    ORDER BY h.date_time DESC
  `).all()

  res.json(history)
<<<<<<< HEAD
 
})
app.post("/ticket-cost", (req, res) => {

  console.log(req.body)

  const {
    ticket_id,
    montant,
    category_name,
    groupe_id
  } = req.body

  const result = sqliteDb.prepare(`
    INSERT INTO montant_tickets (
      ticket_id,
      montant,
      category_name,
      groupe_id
    )
    VALUES (?, ?, ?, ?)
  `).run(
    ticket_id,
    montant,
    category_name,
    groupe_id
  )

  console.log("INSERT ID =", result.lastInsertRowid)

  res.json({ success: true })
})
app.delete("/ticket-cost/last/:ticket_id", (req, res) => {

  const ticket_id = req.params.ticket_id

  console.log("ticket =", ticket_id)

  const lastGroup = sqliteDb.prepare(`
    SELECT groupe_id
    FROM montant_tickets
    WHERE ticket_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(ticket_id)

  console.log("lastGroup =", lastGroup)

  if (!lastGroup) {
    return res.json({ success: true })
  }

  const lignes = sqliteDb.prepare(`
    SELECT *
    FROM montant_tickets
    WHERE groupe_id = ?
  `).all(lastGroup.groupe_id)

  console.log("LIGNES A SUPPRIMER =", lignes)

  const result = sqliteDb.prepare(`
    DELETE FROM montant_tickets
    WHERE groupe_id = ?
  `).run(lastGroup.groupe_id)

  console.log("DELETE RESULT =", result)

  res.json({
    success: true,
    deleted: result.changes
  })
})

=======

})
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
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
<<<<<<< HEAD
  const connection = await db.getConnection()
  try {
    const results = []
    await connection.beginTransaction()
    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    )
    // USERS
    try {
=======

  const connection = await db.getConnection()

  try {

    const results = []

    await connection.beginTransaction()

    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 0"
    )

    // USERS

    try {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
      await connection.query(`
        DELETE FROM users_groups
        WHERE user_id != 1
      `)
<<<<<<< HEAD
    } catch {}
    try {
=======

    } catch {}

    try {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
      const [usersResult] =
        await connection.query(`
          DELETE FROM users
          WHERE id != 1
        `)
<<<<<<< HEAD
=======

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
      results.push({
        table: "users",
        deleted: usersResult.affectedRows
      })
<<<<<<< HEAD
    } catch {}
    try {
      await connection.query(
        "DELETE FROM login_attempts"
      )
    } catch {}
    // TABLES MYSQL
    for (const table of tablesToReset) {
      try {
=======

    } catch {}

    try {

      await connection.query(
        "DELETE FROM login_attempts"
      )

    } catch {}

    // TABLES MYSQL

    for (const table of tablesToReset) {

      try {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
        const [result] =
          await connection.query(
            `DELETE FROM ${table}`
          )
<<<<<<< HEAD
        try {
          await connection.query(
            `ALTER TABLE ${table} AUTO_INCREMENT = 1`
          )
        } catch {}
=======

        try {

          await connection.query(
            `ALTER TABLE ${table} AUTO_INCREMENT = 1`
          )

        } catch {}

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
        results.push({
          table,
          deleted: result.affectedRows
        })
<<<<<<< HEAD
      } catch (err) {
=======

      } catch (err) {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
        console.error(
          table,
          err.message
        )
      }
    }

<<<<<<< HEAD

sqliteDb.prepare("DELETE FROM montant_tickets").run()
sqliteDb.prepare("DELETE FROM ticket_history").run()
=======
sqliteDb.exec("PRAGMA foreign_keys = OFF")

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
sqliteDb.prepare("DELETE FROM settings").run()
sqliteDb.prepare("DELETE FROM tickets").run()
sqliteDb.prepare("DELETE FROM t_status").run()
sqliteDb.prepare("DELETE FROM t_priority").run()
<<<<<<< HEAD
sqliteDb.prepare(`
  DELETE FROM sqlite_sequence
  WHERE name IN (
    'montant_tickets',
    'ticket_history',
=======

sqliteDb.prepare(`
  DELETE FROM sqlite_sequence
  WHERE name IN (
>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    'settings',
    'tickets',
    't_status',
    't_priority'
  )
`).run()
<<<<<<< HEAD
    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 1"
    )
    await connection.commit()
=======

sqliteDb.exec("PRAGMA foreign_keys = ON")

    await connection.query(
      "SET FOREIGN_KEY_CHECKS = 1"
    )

    await connection.commit()

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.json({
      success: true,
      message: "Reset terminé",
      results: results
    })
<<<<<<< HEAD
  } catch (error) {
    await connection.rollback()
=======

  } catch (error) {

    await connection.rollback()

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
    res.status(500).json({
      success: false,
      message: error.message
    })
<<<<<<< HEAD
  } finally {
    connection.release()
  }
})
app.listen(3099, () => {
=======

  } finally {

    connection.release()
  }
})

app.listen(3099, () => {

>>>>>>> daf0be827e6be12262e7287fc37c80dad2a90dd8
  console.log(
    "[reset-server] http://localhost:3099"
  )
})