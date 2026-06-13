const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const DB_PATH = path.join(__dirname, 'finanflex.db');

let db = null;

class Database {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  run(sql, params = []) {
    this._db.run(sql, params);
    const result = this._db.exec("SELECT last_insert_rowid() as id");
    this._lastRowId = result && result[0] && result[0].values ? result[0].values[0][0] : null;
    this.save();
  }

  get(sql, params = []) {
    const stmt = this._db.prepare(sql);
    if (!stmt) return undefined;
    stmt.bind(params);
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      stmt.free();
      const row = {};
      cols.forEach((col, i) => { row[col] = vals[i]; });
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(sql, params = []) {
    const stmt = this._db.prepare(sql);
    if (!stmt) return [];
    stmt.bind(params);
    const rows = [];
    const cols = stmt.getColumnNames();
    while (stmt.step()) {
      const vals = stmt.get();
      const row = {};
      cols.forEach((col, i) => { row[col] = vals[i]; });
      rows.push(row);
    }
    stmt.free();
    return rows;
  }

  exec(sql) {
    this._db.exec(sql);
    this.save();
  }

  get lastInsertRowid() {
    return this._lastRowId;
  }

  save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  sqlDb.run('PRAGMA foreign_keys = ON');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  sqlDb.exec(schema);

  try { sqlDb.run('ALTER TABLE clientes ADD COLUMN pin TEXT DEFAULT \'\''); } catch (e) {}

  db = new Database(sqlDb);

  const adminCount = db.get('SELECT COUNT(*) as count FROM admins');
  if (!adminCount || adminCount.count === 0) {
    const hash = bcrypt.hashSync(config.adminPassword, 10);
    db.run('INSERT INTO admins (nome, email, senha_hash) VALUES (?, ?, ?)',
      ['Administrador', config.adminEmail, hash]);
    console.log('Admin padrão criado:', config.adminEmail);
  }

  return db;
}

module.exports = getDb;
