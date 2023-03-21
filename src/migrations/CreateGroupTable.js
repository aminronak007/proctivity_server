const { getCurrentTime } = require("../helpers/helpers");
class CreateGroupTable {
  constructor() {}

  async create(prefix) {
    try {
      const migration_name = prefix + "CreateGroupTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      let table_name = prefix + "groups";

      if (rows.length == 0) {
        let [create, fields_create] = await connectPool.query(
          `CREATE TABLE IF NOT EXISTS ` +
            table_name +
            ` (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        name varchar(100) DEFAULT NULL,
                        default_group INT DEFAULT 0,
                        created_at DATETIME DEFAULT NULL,
                        updated_at DATETIME DEFAULT NULL
                    )`
        );

        let [insert_packages, fields_insert_packages] = await connectPool.query(
          `INSERT INTO ` + table_name + ` SET ?`,
          [
            {
              name: "Default Group",
              default_group: 1,
              created_at: getCurrentTime(),
              updated_at: getCurrentTime(),
            },
          ]
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

module.exports = new CreateGroupTable();
