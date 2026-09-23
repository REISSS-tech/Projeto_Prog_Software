import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

const query = db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        username        TEXT NOT NULL UNIQUE,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL
    );
`);

query.run();

const queryPerfil = db.query(`
    CREATE TABLE IF NOT EXISTS perfil_usuario (
        id_perfil        INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario       INTEGER NOT NULL UNIQUE,
        foto_perfil      TEXT,
        curso             TEXT,
        objetivo_estudo   TEXT,
        data_nascimento   TEXT,

        FOREIGN KEY (id_usuario)
            REFERENCES users(id)
            ON DELETE CASCADE
    );
`);

queryPerfil.run();

export { db };
