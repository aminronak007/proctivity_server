const bcriptjs = require("bcryptjs");
const { getCurrentTime, getLogo } = require("../helpers/helpers");
class CreateUserAndTokenTable {
    constructor() {}

    async create() {
        try {
            const migration_name = "CreateUserAndTokenTable";
            const [rows, fields] = await connectPool.query(
                "select id from migrations where name=?",
                [migration_name]
            );

            if (rows.length == 0) {
                const [create, fields_create] = await connectPool.query(
                    `CREATE TABLE users (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        role varchar(255) DEFAULT NULL,
                        parent int DEFAULT 0,
                        username varchar(255) DEFAULT NULL,
                        companyname varchar(255) DEFAULT NULL,
                        email varchar(255) DEFAULT NULL,
                        phone bigint DEFAULT NULL,
                        brandcolor varchar(255) DEFAULT NULL,
                        logo longblob DEFAULT NULL,
                        password varchar(255) DEFAULT NULL,
                        table_prefix varchar(255) DEFAULT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME on update CURRENT_TIMESTAMP NULL DEFAULT NULL
                    )`
                );
                let hashed_password = await bcriptjs.hash("admin@123", 8);
                let data = {
                    username: "Super Admin",
                    companyname: "Proctivity",
                    email: "superadmin@yopmail.com",
                    brandcolor: "#FFFFFF",
                    password: hashed_password,
                    created_at: getCurrentTime(),
                    updated_at: getCurrentTime(),
                    role: "Super Admin",
                    parent: 0,
                };
                const [rows, fields] = await connectPool.query(
                    "INSERT INTO users set ? ",
                    data
                );

                const [create_token, fields_create_token] =
                    await connectPool.query(
                        `CREATE TABLE users_token (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        user_id int DEFAULT NULL,
                        token varchar(255) DEFAULT NULL,
                        created_at DATETIME DEFAULT NULL
                    )`
                    );

                const [insert_migration, fields_insert_migration] =
                    await connectPool.query(`INSERT INTO migrations SET ?`, {
                        name: migration_name,
                    });
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new CreateUserAndTokenTable();
