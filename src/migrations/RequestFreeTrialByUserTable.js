class RequestFreeTrialByUserTable {
  constructor() {}

  async create() {
    try {
      const migration_name = "RequestFreeTrialByUserTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      let table_name = "user_request_free_trial";

      if (rows.length == 0) {
        let [create, fields_create] = await connectPool.query(
          `CREATE TABLE IF NOT EXISTS ` +
            table_name +
            ` (
                      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                      user_id INT DEFAULT NULL,
                      package_id INT DEFAULT NULL,
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

module.exports = new RequestFreeTrialByUserTable();
