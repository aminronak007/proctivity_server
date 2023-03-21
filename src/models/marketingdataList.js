const { getCurrentTime } = require("../helpers/helpers");
const user = require("./user");

class MarketingDataList {
  constructor() {}

  // Fetching Marketing data fields list by its type.
  async getMarketingData(req) {
    let input = req.body;
    let offset = (input.page - 1) * input.limit;
    let totalRecords = 0;
    let whereString = "";
    if (
      req.user.parent !== null &&
      req.user.parent !== undefined &&
      req.user.parent !== 0
    ) {
      let permissions = req.user.permissions.filter((x) =>
        x.module.includes("_status_")
      );

      let status_id = [];
      permissions.map((x) => {
        if (x.view_permission === 1) {
          status_id.push(x.module.split("_")[3] * 1);
        }
        return status_id;
      });
      whereString = `where ${req.user.table_prefix}customer_entries.status_id IN (${status_id})`;
    }
    try {
      const [rows_marketing, fields] = await connectPool.query(
        `SELECT
                ${req.user.table_prefix}customer_entries.id,
                ${req.user.table_prefix}customer_entries.email,
                ${req.user.table_prefix}customer_entries.first_name,
                ${req.user.table_prefix}customer_entries.last_name,
                ${req.user.table_prefix}customer_entries.updated_at,
                RC.value as RepeatCustomer,
                CT.value as CustomerType,
                SR.value as ServiceType,
                FS.value as FindUs,
                RC.id as repeat_customer_id,
                CT.id as customer_type_id,
                SR.id as service_type_id,
                FS.id as customer_find_us_id
            FROM ${req.user.table_prefix}customer_entries
            LEFT JOIN ${req.user.table_prefix}marketing_data as RC ON RC.id = ${req.user.table_prefix}customer_entries.repeat_customer_id
            LEFT JOIN ${req.user.table_prefix}marketing_data as CT ON CT.id = ${req.user.table_prefix}customer_entries.customer_type_id
            LEFT JOIN ${req.user.table_prefix}marketing_data as SR ON SR.id = ${req.user.table_prefix}customer_entries.service_type_id
            LEFT JOIN ${req.user.table_prefix}marketing_data as FS ON FS.id = ${req.user.table_prefix}customer_entries.customer_find_us_id ${whereString} LIMIT ${input.limit} OFFSET ${offset}`
      );

      const [count_marketing_data, field] = await connectPool.query(
        `SELECT
                COUNT(${req.user.table_prefix}customer_entries.id) as count
                FROM ${req.user.table_prefix}customer_entries ${whereString}`
      );
      totalRecords = count_marketing_data[0].count;

      return {
        marketingData: rows_marketing,
        totalRecords: totalRecords,
      };
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update Customer marketing data fields.
  async updateMarketingData(req) {
    var input = req.body;
    try {
      const [rows, updateFields] = await connectPool.query(
        `UPDATE ${req.user.table_prefix}customer_entries 
                    SET 
                    customer_find_us_id = ?,
                    repeat_customer_id = ?,                                                 
                    service_type_id = ?,
                    customer_type_id = ?,
                    updated_at = ? 
                    WHERE id = ?`,
        [
          input.customer_find_us_id,
          input.repeat_customer_id,
          input.service_type_id,
          input.customer_type_id,
          getCurrentTime(),
          input.id,
        ]
      );
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new MarketingDataList();
