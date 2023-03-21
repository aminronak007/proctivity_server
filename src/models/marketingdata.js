const { getCurrentTime } = require("../helpers/helpers");

class MarketingData {
  constructor() {}

  // Fetching all Marketing data fields.
  async getMarketingData(req) {
    let whereStr = req.params.flag === "list" ? "" : "status = 'active' and ";
    try {
      const [rows_marketing, fields] = await connectPool.query(
        `SELECT * FROM ${req.user.table_prefix}marketing_data WHERE ${whereStr} is_delete = 0`
      );

      return rows_marketing;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Add new Marketing data fields.
  async addMarketingData(req) {
    var input = req.body;
    try {
      const [rows, fields] = await connectPool.query(
        `INSERT INTO ${req.user.table_prefix}marketing_data set ? `,
        { ...input, created_at: getCurrentTime() }
      );
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update each Marketing data fields by its id.
  async updateMarketingData(req) {
    var input = req.body;
    try {
      const [rows, updateFields] = await connectPool.query(
        `UPDATE ${req.user.table_prefix}marketing_data SET 
                                                    value = ?,
                                                    status = ?,
                                                    updated_at = ? 
                                                    WHERE id = ?`,
        [input.value, input.status, getCurrentTime(), input.id]
      );
      return rows;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Delete each Marketing data fields by its id.
  async deleteMarketingData(req) {
    var id = req.body.id;
    try {
      const [rows_marketing, fields] = await connectPool.query(
        `SELECT id from ${req.user.table_prefix}marketing_data WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows_marketing.length === 1) {
        const [rows, updateFields] = await connectPool.query(
          `UPDATE ${req.user.table_prefix}marketing_data SET is_delete = 1
                                                    WHERE id = ?`,
          [id]
        );
        return rows;
      }
      return rows_marketing;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Fetching all Marketing data fields by its type.
  async getMarketingDataByType(req) {
    var input = req.body;

    try {
      const [rows_marketing, fields] = await connectPool.query(
        `SELECT * FROM ${req.user.table_prefix}marketing_data WHERE type = ?`,
        [input.type]
      );

      return rows_marketing;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new MarketingData();
