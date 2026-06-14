import Database from "better-sqlite3";
const DB_PATH = "D:/EVALUTION-SNIP/snipe-it-8.6.1/snipe-it-8.6.1/database/database.sqlite";

let db;
try {
    db = new Database(DB_PATH, { fileMustExist: true });
    console.log(" Connexion réussie à la base SQLite via db.js");
} catch (error) {
    console.error("❌ Impossible d'ouvrir la base de données :", error.message);
    process.exit(1);
}
export default db;