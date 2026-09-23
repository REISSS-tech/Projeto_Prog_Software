//            BANCO DE DADOS     HTTP
// [C]reat    insert             post
// [R]read    select             get
// [U]pdate   update             put
// [U]pdate   update             patch
// [D]elete   delete             delete

import { db } from "./db"

const srv = Bun.serve({
    port: 3000,
    routes: {
        "/user": {
            GET: () => {
                const query = db.query(`SELECT * FROM users`)
                const data = query.all()
                return Response.json(data)
            },

            POST: async (req) => {
                let body
                try {
                    body = await req.body.json()
                } catch (error: any) {
                    return Response.json({
                        message: "JSON mal formado",
                        parseError: error
                    }, { status: 400 })
                }
                if (!body.username)
                    return Response.json({ message: "Falta da informação: username" }, { status: 400 })
                if (!body.email)
                    return Response.json({ message: "Falta da informação: email" }, { status: 400 })
                if (!body.password)
                    return Response.json({ message: "Falta da informação: password" }, { status: 400 })
                const query = db.query(`
                    INSERT INTO users(username, email, password_hash)
                    VALUES(:username, :email, :password_hash)
                `)
                try {
                    const dbResp = query.run({
                        ':username': body.username,
                        ':email': body.email,
                        ':password_hash': body.password
                    })
                    return Response.json({
                        "message": "deu boa garote!",
                        dbResp
                    })
                } catch (e: any) {
                    if (e.code == "SQLITE_CONSTRAINT_UNIQUE") {
                        return Response.json({
                            message: "Username e Email precisam ser únicos",
                            code: "UNIQUE:CONSTRAINT"
                        }, { status: 400 })
                    }
                    return Response.json({
                        message: "Erro ao inserir no banco de dados",
                        dbError: e
                    }, { status: 500 })
                }
            },
        },

        "/user/:id": {
            GET: (req) => {
                const id = req.params.id
                const query = db.query(`SELECT * FROM users WHERE id=:id`)
                const data = query.get({ ':id': id })
                return Response.json(data)
            },

            PUT: async (req) => {
                const body = await req.body.json()
                const query = db.query(`UPDATE users SET username = :username, email = :email, password_hash = :password WHERE id = :id`)
                const dbResp = query.run({
                    ':username': body.username,
                    ':email': body.email,
                    ':password': body.password,
                    ':id': req.params.id
                })
                return Response.json(dbResp)
            },

            DELETE: (req) => {
                const query = db.query(`DELETE FROM users WHERE id=:id`)
                const data = query.run({ ':id': req.params.id })
                return Response.json(data)
            },
        },
        "/perfil": {
            GET: () => {
                const query = db.query(`
                    SELECT
                        id_perfil,
                        id_usuario,
                        foto_perfil,
                        curso,
                        objetivo_estudo,
                        data_nascimento
                    FROM perfil_usuario
                `);

                const data = query.all();

                return Response.json(data);
            },

            POST: async (req) => {
                const body = await req.json();

                const query = db.query(`
                    INSERT INTO perfil_usuario (
                        id_usuario,
                        foto_perfil,
                        curso,
                        objetivo_estudo,
                        data_nascimento
                    )
                    VALUES (
                        :id_usuario,
                        :foto_perfil,
                        :curso,
                        :objetivo_estudo,
                        :data_nascimento
                    )
                `);

                const dbResp = query.run({
                    ":id_usuario": body.id_usuario,
                    ":foto_perfil": body.foto_perfil,
                    ":curso": body.curso,
                    ":objetivo_estudo": body.objetivo_estudo,
                    ":data_nascimento": body.data_nascimento
                });

                return Response.json({
                    message: "Perfil criado com sucesso!",
                    dbResp
                }, { status: 201 });
            }
        },

        "/perfil/:id": {
            GET: (req) => {
                const query = db.query(`
                    SELECT
                        p.id_perfil,
                        p.id_usuario,
                        u.username,
                        u.email,
                        p.foto_perfil,
                        p.curso,
                        p.objetivo_estudo,
                        p.data_nascimento
                    FROM perfil_usuario p
                    INNER JOIN users u
                        ON u.id = p.id_usuario
                    WHERE p.id_perfil = :id
                `);

                const data = query.get({
                    ":id": req.params.id
                });

                if (!data) {
                    return Response.json(
                        { message: "Perfil não encontrado." },
                        { status: 404 }
                    );
                }

                return Response.json(data);
            },

            PUT: async (req) => {
                const body = await req.json();

                const query = db.query(`
                    UPDATE perfil_usuario
                    SET
                        foto_perfil = :foto_perfil,
                        curso = :curso,
                        objetivo_estudo = :objetivo_estudo,
                        data_nascimento = :data_nascimento
                    WHERE id_perfil = :id
                `);

                const dbResp = query.run({
                    ":foto_perfil": body.foto_perfil,
                    ":curso": body.curso,
                    ":objetivo_estudo": body.objetivo_estudo,
                    ":data_nascimento": body.data_nascimento,
                    ":id": req.params.id
                });

                if (dbResp.changes === 0) {
                    return Response.json(
                        { message: "Perfil não encontrado." },
                        { status: 404 }
                    );
                }

                return Response.json({
                    message: "Perfil atualizado com sucesso!",
                    dbResp
                });
            },

            DELETE: (req) => {
                const query = db.query(`
                    DELETE FROM perfil_usuario
                    WHERE id_perfil = :id
                `);

                const dbResp = query.run({
                    ":id": req.params.id
                });

                if (dbResp.changes === 0) {
                    return Response.json(
                        { message: "Perfil não encontrado." },
                        { status: 404 }
                    );
                }

                return Response.json({
                    message: "Perfil excluído com sucesso!",
                    dbResp
                });
            }
        }
    }
});

console.log(`Servidor em ${srv.url}`);
