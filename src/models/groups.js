const { assign } = require("lodash");
const { getCurrentTime, unlinkFiles } = require("../helpers/helpers");
const { deleteCustomerData } = require("../models/customer");

class Groups {
  constructor() {}

  // Add Group and multiple statuses.
  async addGroupAndStatus(req) {
    try {
      let table_name = req.user.table_prefix;
      let input = req.body;
      const [check_group_exists, check_fields] = await connectPool.query(
        `SELECT name from ${table_name}groups WHERE name = ?`,
        [input.name]
      );
      if (check_group_exists.length === 0) {
        const [insert_group, fields] = await connectPool.query(
          `INSERT into ${table_name}groups SET ?`,
          {
            name: input.name,
            created_at: getCurrentTime(),
          }
        );

        let s = 0;

        while (s < input.status.length) {
          let statusData = {
            group_id: insert_group.insertId,
            name: input.status[s].name,
            position: s + 1,
            created_at: getCurrentTime(),
          };

          const [insert_status, fields2] = await connectPool.query(
            `INSERT into ${table_name}groups_status SET ?`,
            statusData
          );
          s++;
        }

        return insert_group;
      }
      return check_group_exists;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Fetching all groups and its status.
  // async getGroupAndStatus(req) {
  //   try {
  //     let table_name = req.user.table_prefix;
  //     const [groups_list, fields] = await connectPool.query(
  //       `SELECT b.*,
  //               GROUP_CONCAT(a.name) as groups_status_names,
  //               GROUP_CONCAT(a.id) AS status_id
  //               FROM ${table_name}groups_status AS a
  //               LEFT JOIN ${table_name}groups AS b
  //               ON b.id = a.group_id
  //               GROUP BY b.name`
  //     );

  //     let list = [];

  //     for (let i = 0; i < groups_list.length; i++) {
  //       let filterStatus = await Object.assign(
  //         [],
  //         groups_list[i].groups_status_names.split(",")
  //       );

  //       let filterStatusId = await Object.assign(
  //         [],
  //         groups_list[i].status_id.split(",")
  //       );

  //       let status = [];

  //       for (let s = 0; s < filterStatus.length; s++) {
  //         status.push({
  //           id: filterStatusId[s],
  //           name: filterStatus[s],
  //         });
  //       }

  //       list.push({
  //         id: groups_list[i].id,
  //         name: groups_list[i].name,
  //         status_names: groups_list[i].groups_status_names,
  //         created_at: groups_list[i].created_at,
  //         updated_at: groups_list[i].updated_at,
  //         status,
  //       });
  //     }

  //     return list;
  //   } catch (e) {
  //     console.log(e);
  //     throw new Error(e);
  //   }
  // }

  // Update group and its status by its id.
  async updateGroupAndStatus(req) {
    try {
      let table_name = req.user.table_prefix;
      let input = req.body;

      const [check_group_exists, fields] = await connectPool.query(
        `SELECT id,name from ${table_name}groups WHERE name = ? AND id != ?`,
        [input.name, input.id]
      );

      if (check_group_exists.length === 0) {
        const [update_group, update_fields] = await connectPool.query(
          `UPDATE ${table_name}groups SET name = ?, updated_at = ? WHERE id = ?`,
          [input.name, getCurrentTime(), input.id]
        );

        if (update_group) {
          let i = 0;
          while (i < input.status.length) {
            const status = input.status[i];
            if (status.id != undefined) {
              let [update_group_status, update_fields] =
                await connectPool.query(
                  `UPDATE ${table_name}groups_status SET name = ? ,position = ?, updated_at = ? WHERE id = ?`,
                  [status.name, status.position, getCurrentTime(), status.id]
                );
            } else {
              let data = {
                group_id: input.id,
                name: status.name,
                position: status.position,
                updated_at: getCurrentTime(),
                created_at: getCurrentTime(),
              };
              let [update_group_status, fields] = await connectPool.query(
                `INSERT into ${table_name}groups_status SET ?`,
                data
              );
            }
            i++;
          }

          if (input.deleted_status.length > 0) {
            const [delete_group_status, update_fields] =
              await connectPool.query(
                `DELETE FROM ${table_name}groups_status WHERE id IN (?)`,
                [input.deleted_status]
              );

            if (delete_group_status) {
              const [get_customer_ids, get_fields] = await connectPool.query(
                `SELECT id from ${table_name}customer_entries WHERE status_id IN (?)`,
                [input.deleted_status]
              );

              if (get_customer_ids.length > 0) {
                let data = await get_customer_ids;
                await deleteCustomerData(table_name, data);
              }
            }
          }
        }
        return update_group;
      }

      return check_group_exists;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Delete group, its status and also customer data related to the particular group.
  async deleteGroupAndStatus(req) {
    try {
      let table_name = req.user.table_prefix;

      const [delete_group, fields] = await connectPool.query(
        `DELETE from ${table_name}groups WHERE id = ?`,
        [req.params.id]
      );

      const [get_customer_ids, cus_fields] = await connectPool.query(
        `SELECT id from ${table_name}customer_entries WHERE group_id = ?`,
        [req.params.id]
      );

      if (delete_group) {
        const [delete_group_status, fields] = await connectPool.query(
          `DELETE from ${table_name}groups_status WHERE group_id = ?`,
          [req.params.id]
        );

        if (get_customer_ids.length > 0) {
          let data = await get_customer_ids;
          await deleteCustomerData(table_name, data);
        }

        return delete_group_status;
      }
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  // Fetching all groups and its multiple status according to its hirarchy.
  async GetGroupStatusHirarchy(req) {
    try {
      const table_prefix = req.user.table_prefix;
      const [result_group, fields_group] = await connectPool.query(
        `SELECT id,name,default_group FROM ${table_prefix}groups`
      );
      let groups_array = [];
      if (result_group.length > 0) {
        for (let i = 0; i < result_group.length; i++) {
          let group = result_group[i];
          group.module_code = "group_" + group.id;
          group.counter = i + 1;
          let [result_group_status, fields_group_status] =
            await connectPool.query(
              `SELECT a.* FROM ${table_prefix}groups_status AS a LEFT JOIN ${table_prefix}groups AS b ON b.id = a.group_id WHERE b.id = ? ORDER BY a.position asc`,
              [group.id]
            );
          if (result_group_status.length > 0) {
            let grou_status_array = [];
            for (let s_i = 0; s_i < result_group_status.length; s_i++) {
              let status = result_group_status[s_i];
              status.module_code = "group_" + group.id + "_status_" + status.id;
              status.counter = s_i + 1;
              grou_status_array.push(status);
            }
            groups_array.push({
              ...group,
              child: grou_status_array,
            });
          }
        }
      }
      return groups_array;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

module.exports = new Groups();
