class CreateCustomerEntryTable {
  constructor() {}

  async create(prefix) {
    try {
      const migration_name = prefix + "CreateCustomerEntryTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      let table_name = prefix + "customer_entries";

      if (rows.length == 0) {
        let [create, fields_create] = await connectPool.query(
          `CREATE TABLE IF NOT EXISTS ` +
            table_name +
            ` (
                    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    reference_number VARCHAR(50) DEFAULT NULL,
                    user_id INT DEFAULT NULL,
                    first_name VARCHAR(255) DEFAULT NULL,
                    last_name VARCHAR(255) DEFAULT NULL,
                    email VARCHAR(255) DEFAULT NULL,
                    phone VARCHAR(255) DEFAULT NULL,
                    address VARCHAR(255) DEFAULT NULL,
                    postal_code VARCHAR(50) DEFAULT NULL,
                    notes VARCHAR(255) DEFAULT NULL,
                    group_id INT DEFAULT NULL,
                    status_id INT DEFAULT NULL,
                    assign_user_id INT DEFAULT NULL,
                    customer_type_id INT DEFAULT NULL,
                    service_type_id INT DEFAULT NULL,
                    repeat_customer_id INT DEFAULT NULL,
                    customer_find_us_id INT DEFAULT NULL,
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

module.exports = new CreateCustomerEntryTable();
