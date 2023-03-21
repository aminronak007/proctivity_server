class CreateProctivityCompanyTable {
    constructor() {}
    async create() {
        try {
            const migration_name = "CreateProctivityCompanyTable";
            const [rows, fields] = await connectPool.query(
                `SELECT id FROM migrations WHERE name=?`,
                [migration_name]
            );
            if (rows.length == 0) {
                const [create_token, fields_create_token] =
                    await connectPool.query(
                        `CREATE TABLE proctivity_company (
                        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        company_email varchar(255) NOT NULL,
                        company_address_city varchar(255) NOT NULL,
                        company_address_country varchar(255) NOT NULL,
                        company_address_line1 varchar(255) NOT NULL,
                        company_address_line2 varchar(255) NOT NULL,
                        company_address_postal_code varchar(255) NOT NULL,
                        company_address_state varchar(255) NOT NULL,
                        company_name varchar(255) NOT NULL,
                        company_phone varchar(255) NOT NULL,
                        company_registration_number varchar(255) NOT NULL,
                        company_structure varchar(255) NOT NULL,
                        company_tax_id varchar(255) NOT NULL,
                        company_vat_id varchar(255) NOT NULL,
                        bank_account_ownership_verification varchar(255) NOT NULL,
                        company_license varchar(255) NOT NULL,
                        company_registration_verification  varchar(255) NOT NULL,
                        company_tax_id_verification  varchar(255) NOT NULL,
                        proof_of_registration  varchar(255) NOT NULL,
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

module.exports = new CreateProctivityCompanyTable();
