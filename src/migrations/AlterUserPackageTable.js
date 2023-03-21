class AlterUserPackageTable {
  constructor() {}

  async alter() {
    try {
      const migration_name = "AlterUserPackageTable";
      const [rows, fields] = await connectPool.query(
        "select id from migrations where name=?",
        [migration_name]
      );

      if (rows.length == 0) {
        const [alter, fields_alter] = await connectPool.query(
          `ALTER TABLE user_packages ADD autoRenew TINYINT NULL DEFAULT NULL AFTER subscription_id `
        );

        await connectPool.query(`INSERT INTO migrations SET ?`, {
          name: migration_name,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AlterUserPackageTable();
