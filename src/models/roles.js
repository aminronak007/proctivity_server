const { getCurrentTime } = require("../helpers/helpers");

class Roles {
  constructor() {}

  // Fetching all roles details.
  async getRoles(req) {
    try {
      const [rows_roles, fields] = await connectPool.query(
        `SELECT * FROM ${req.user.table_prefix}roles`
      );

      return rows_roles;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Add new Role.
  async addRole(req) {
    var input = req.body;
    try {
      const [rows_roles, fields] = await connectPool.query(
        `SELECT name from ${req.user.table_prefix}roles WHERE name = ? LIMIT 1`,
        [input.name]
      );

      if (rows_roles.length === 0) {
        const [rows, fields] = await connectPool.query(
          `INSERT INTO ${req.user.table_prefix}roles set ? `,
          { ...input, created_at: getCurrentTime() }
        );
        return rows;
      }
      return rows_roles;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Update role by its id.
  async updateRole(req) {
    var input = req.body;
    try {
      const [rows_roles, fields] = await connectPool.query(
        `SELECT id from ${req.user.table_prefix}roles WHERE id = ? LIMIT 1`,
        [input.id]
      );

      if (rows_roles.length === 1) {
        const [check_role, fields] = await connectPool.query(
          `SELECT name from ${req.user.table_prefix}roles WHERE id != ? and name = ? LIMIT 1`,
          [input.id, input.name]
        );
        if (check_role.length === 0) {
          const [rows, updateFields] = await connectPool.query(
            `UPDATE ${req.user.table_prefix}roles SET 
                    name = ?,
                    updated_at = ? 
                    WHERE id = ?`,
            [input.name, getCurrentTime(), input.id]
          );
          return rows;
        }
        return check_role;
      }
      return rows_roles;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Delete role by its id.
  async deleteRole(req) {
    var id = req.body.id;
    try {
      const [rows_roles, fields] = await connectPool.query(
        `SELECT id from ${req.user.table_prefix}roles WHERE id = ? LIMIT 1`,
        [id]
      );

      if (rows_roles.length === 1) {
        const [rows, updateFields] = await connectPool.query(
          `DELETE FROM ${req.user.table_prefix}roles 
                    WHERE id = ?`,
          [id]
        );
        return rows;
      }
      return rows_roles;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new Roles();
