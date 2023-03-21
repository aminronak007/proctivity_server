const { getCurrentTime } = require("../helpers/helpers");
class CreateUserMarketingDataTable {
  constructor() {}

  async create(prefix) {
    try {
      const migration_name = prefix + "CreateUserMarketingDataTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      let table_name = prefix + "marketing_data";

      if (rows.length == 0) {
        let [create, fields_create] = await connectPool.query(
          `CREATE TABLE IF NOT EXISTS ` +
            table_name +
            ` (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        type ENUM('Customer','Service','Repeat Customer','Where did you find us') DEFAULT NULL,
                        value varchar(50) DEFAULT NULL,
                        status ENUM('active','inactive') DEFAULT 'active',
                        is_delete INT DEFAULT 0,
                        created_at DATETIME DEFAULT NULL, 
                        updated_at DATETIME DEFAULT NULL
                    )`
        );

        let [insert_packages, fields_insert_packages] = await connectPool.query(
          `INSERT INTO ` + table_name + ` SET ?`,
          [
            {
              type: "Repeat Customer",
              value: "Yes",
              status: "active",
              created_at: getCurrentTime(),
              updated_at: getCurrentTime(),
            },
          ]
        );

        // [insert_packages, fields_insert_packages] = await connectPool.query(
        //   `INSERT INTO ` + table_name + ` SET ?`,
        //   [
        //     {
        //       type: "Service",
        //       value: "Business Services",
        //       status: "active",
        //       created_at: getCurrentTime(),
        //       updated_at: getCurrentTime(),
        //     },
        //   ]
        // );

        [insert_packages, fields_insert_packages] = await connectPool.query(
          `INSERT INTO ` + table_name + ` SET ?`,
          [
            {
              type: "Repeat Customer",
              value: "No",
              status: "active",
              created_at: getCurrentTime(),
              updated_at: getCurrentTime(),
            },
          ]
        );

        // [insert_packages, fields_insert_packages] = await connectPool.query(
        //   `INSERT INTO ` + table_name + ` SET ?`,
        //   [
        //     {
        //       type: "Where did you find us",
        //       value: "Google Ads",
        //       status: "active",
        //       created_at: getCurrentTime(),
        //       updated_at: getCurrentTime(),
        //     },
        //   ]
        // );

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

module.exports = new CreateUserMarketingDataTable();
