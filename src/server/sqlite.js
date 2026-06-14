import Database from "better-sqlite3"

const db = new Database("ticket_new.sqlite")

db.exec(`
  CREATE TABLE IF NOT EXISTS t_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS t_priority (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num_ticket INTEGER,
    date TEXT,
    heure TEXT,
    titre TEXT,
    description TEXT,
    status_id INTEGER,
    priority_id INTEGER,
    items TEXT,

    FOREIGN KEY(status_id) REFERENCES t_status(id),
    FOREIGN KEY(priority_id) REFERENCES t_priority(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_id INTEGER UNIQUE,
    color TEXT,
    label TEXT,

    FOREIGN KEY(status_id)
      REFERENCES t_status(id)
  );
  CREATE TABLE IF NOT EXISTS ticket_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  status_id INTEGER NOT NULL,
  date_time TEXT NOT NULL
  );
`)
export function addHistory(
  ticketId,
  statusId
) {

  sqliteDb.prepare(`
    INSERT INTO ticket_history (
      ticket_id,
      status_id,
      date_time
    )
    VALUES (?, ?, ?)
  `).run(
    ticketId,
    statusId,
    new Date().toISOString()
  )

}
export default db