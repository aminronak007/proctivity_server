const { getCurrentTime } = require("../helpers/helpers");

class Features {
  constructor() {}

  // Fetching all features.
  async getFeatures() {
    try {
      const [rows_features, fields] = await connectPool.query(
        `SELECT * FROM features`
      );

      return rows_features;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Add new Features.
  async addFeature(input) {
    try {
      const [rows_features, fields] = await connectPool.query(
        `SELECT name from features WHERE name = ? LIMIT 1`,
        [input.name]
      );

      if (rows_features.length === 0) {
        const [rows, fields] = await connectPool.query(
          "INSERT INTO features set ? ",
          { ...input, created_at: getCurrentTime() }
        );
        return rows;
      }
      return rows_features;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Updating feature by its id.
  async updateFeature(input) {
    try {
      const [rows_features, fields] = await connectPool.query(
        `SELECT id from features WHERE id = ? LIMIT 1`,
        [input.id]
      );

      if (rows_features.length === 1) {
        const [check_features, fields] = await connectPool.query(
          `SELECT name from features WHERE id != ? and name = ? LIMIT 1`,
          [input.id, input.name]
        );
        if (check_features.length === 0) {
          const [rows, updateFields] = await connectPool.query(
            `UPDATE features SET 
                    name = ?,
                    status = ?,
                    updated_at = ? 
                    WHERE id = ?`,
            [input.name, input.status, getCurrentTime(), input.id]
          );
          return rows;
        }
        return check_features;
      }
      return rows_features;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Delete feature by its id.
  async deleteFeature(id) {
    try {
      const [rows_features, fields] = await connectPool.query(
        `SELECT id from features WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows_features.length === 1) {
        const [rows, updateFields] = await connectPool.query(
          `DELETE FROM features 
                    WHERE id = ?`,
          [id]
        );
        return rows;
      }
      return rows_features;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new Features();
