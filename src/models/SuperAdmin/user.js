const { packageinfo } = require("../user");
class User {
  constructor() {}

  // Fetcing all Main Users (Admin) details.
  async GetAllMainUsers(input) {
    try {
      let search = input.search ? input.search : "";
      let offset = (input.page - 1) * input.limit;
      var searchString = input.search
        ? `and (username LIKE '%${search}%' OR role LIKE '%${search}%' OR email LIKE '%${search}%' OR phone LIKE '%${search}%')`
        : "";

      let main_conditions = ` parent = 0 AND is_delete = 0 AND role != 'Super Admin'`;
      const [rows_user, fields] = await connectPool.query(
        `SELECT * from users WHERE ${main_conditions} ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`
      );

      let count = "";
      if (input.search) {
        count = await connectPool.query(
          `SELECT COUNT(id) as totalRecords from users WHERE ${main_conditions} ${searchString} ORDER BY ${input.sort_on} ${input.sort} LIMIT ${input.limit} OFFSET ${offset}`
        );
      } else {
        count = await connectPool.query(
          `SELECT COUNT(id) as totalRecords from users WHERE ${main_conditions}`
        );
      }

      let totalRecords = await count[0][0]?.totalRecords;

      let users = [];
      if (rows_user.length > 0) {
        for (let i = 0; i < rows_user.length; i++) {
          let r_u = rows_user[i];
          r_u.package = await packageinfo(r_u.id);
          users.push(r_u);
        }
      }
      let data = {
        users: users,
        totalRecords: totalRecords,
      };

      return data;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  async requestFreeTrial(input) {
    try {
      let user_id = input.user_id;
      const [check_user, check_fields] = await connectPool.query(
        `SELECT id from users WHERE id = ? AND is_request = 0`,
        [user_id]
      );

      if (check_user.length === 1) {
        const [update_add_free_trial, field] = await connectPool.query(
          `UPDATE users SET is_request = 1 WHERE id = ?`,
          [user_id]
        );
        return update_add_free_trial;
      }

      return check_user;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new User();
