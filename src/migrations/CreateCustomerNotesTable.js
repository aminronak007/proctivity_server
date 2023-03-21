const { getCurrentTime } = require("../helpers/helpers");
class CreateCustomerNotesTable {
  constructor() {}

  async create(prefix) {
    try {
      const migration_name = prefix + "CreateCustomerNotesTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      let table_name = prefix + "customer_notes";

      if (rows.length == 0) {
        let [create, fields_create] = await connectPool.query(
          `CREATE TABLE IF NOT EXISTS ` +
            table_name +
            ` (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    customer_id INT DEFAULT NULL,
                    user_id INT DEFAULT NULL,
                    notes VARCHAR(255) DEFAULT NULL,
                    main_note int DEFAULT NULL,
                    created_at DATETIME DEFAULT NULL,
                    updated_at DATETIME DEFAULT NULL
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

module.exports = new CreateCustomerNotesTable();
