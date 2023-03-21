const {
    getCurrentTime,
    generateReferenceNumber,
    getLogo,
} = require("../helpers/helpers");
const CustomerEmailTemplate = require("../emailTemplates/CustomerEmailTemplate");
const emailHandler = require("../handlers/emailhandler");
const { unlinkFiles } = require("../helpers/helpers");
class Customer {
    constructor() {}

    // Fetching all Customers list with pagination and searching.
    async getCustomerList(req) {
        try {
            let table_name = req.user.table_prefix;
            let input = req.body;
            let count = 0;
            let search = input.search;
            let offset = (input.page - 1) * input.limit;

            var searchString = search
                ? `and (reference_number LIKE '%${search}%' OR 
                first_name LIKE '%${search}%' OR
                last_name LIKE '%${search}%' OR 
                email LIKE '%${search}%' OR
                phone LIKE '%${search}%')`
                : "";

            count = await connectPool.query(
                `SELECT COUNT(id) as totalRecords from ${table_name}customer_entries 
            WHERE group_id = ${input.group_id} AND status_id = ${input.status_id} ${searchString}
            ORDER BY id DESC`
            );

            let query = `SELECT a.id,a.*,b.id as eventID from ${table_name}customer_entries as a 
            Left Join ${table_name}customer_events as b on a.id = b.customer_id 
            WHERE a.group_id = ${input.group_id} AND a.status_id = ${input.status_id} ${searchString}
           Group By a.id,b.id ORDER BY a.id DESC LIMIT ${input.limit} OFFSET ${offset}`;

            const [customer_details, fields] = await connectPool.query(query);
            let result = {};
            if (customer_details.length !== 0) {
                result.data = customer_details;
                result.totalRecords = count[0][0]?.totalRecords;
            } else {
                result.data = [];
                result.totalRecords = 0;
            }
            return result;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetaching all Status list according to group id.
    async getStatusByGroupId(req) {
        try {
            let table_name = req.user.table_prefix;
            let input = req.body;

            const [get_status, fields] = await connectPool.query(
                `SELECT * FROM ${table_name}groups_status WHERE group_id = ? ORDER BY position asc`,
                [input.group_id]
            );

            return get_status;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Add New Customers with all its neccessary details.
    async addCustomerDetails(req, filenames) {
        try {
            let table_name = await req.user.table_prefix;
            let input = await req.body;
            let group_id = input.group_id;
            let status_id = input.status_id;
            if (input.status_id == "undefined") {
                group_id = 1;
                status_id = 1;
            }
            let data = {
                reference_number: generateReferenceNumber(),
                user_id: input.user_id,
                first_name: input.first_name,
                last_name: input.last_name,
                email: input.email,
                phone: input.phone,
                address: input.address,
                postal_code: input.postal_code,
                city: input.city,
                country: input.country,
                state: input.state,
                notes: input.notes,
                group_id: group_id,
                status_id: status_id,
                customer_type_id:
                    input.customer_type_id == "undefined"
                        ? null
                        : input.customer_type_id,
                service_type_id:
                    input.service_type_id == "undefined"
                        ? null
                        : input.service_type_id,
                repeat_customer_id:
                    input.repeat_customer_id == "undefined"
                        ? null
                        : input.repeat_customer_id,
                customer_find_us_id:
                    input.customer_find_us_id == "undefined"
                        ? null
                        : input.customer_find_us_id,
                created_at: getCurrentTime(),
            };

            const [check_customer_email, check_field] = await connectPool.query(
                `SELECT email from ${table_name}customer_entries WHERE email = ?`,
                [input.email]
            );

            if (check_customer_email.length === 0) {
                const [rows_customer_entries, add_fields] =
                    await connectPool.query(
                        `INSERT into ${table_name}customer_entries SET ?`,
                        data
                    );

                if (rows_customer_entries) {
                    const customer_id = rows_customer_entries.insertId;

                    let i = 0;
                    while (i < filenames.length) {
                        let data = {
                            customer_id: customer_id,
                            user_id: input.user_id,
                            filename: filenames[i].filename,
                            original_name: filenames[i].original_name,
                            created_at: getCurrentTime(),
                        };
                        const [insert_customer_docs, add_fields] =
                            await connectPool.query(
                                `INSERT into ${table_name}customer_documents SET ?`,
                                data
                            );
                        i++;
                    }

                    if (input.notes) {
                        let notesData = {
                            customer_id: customer_id,
                            user_id: input.user_id,
                            notes: input.notes,
                            main_note: 1,
                            created_at: getCurrentTime(),
                        };

                        const [insert_notes, fields] = await connectPool.query(
                            `INSERT into ${table_name}customer_notes SET ?`,
                            notesData
                        );
                    }

                    let subject = "Customer Entry";
                    const msg = await CustomerEmailTemplate.MailSent({
                        username: data.first_name + " " + data.last_name,
                    });

                    const result = await emailHandler.sendEmail(
                        data.email,
                        msg,
                        subject,
                        "",
                        getLogo()
                    );
                }

                return rows_customer_entries;
            }
            return check_customer_email;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update Customer group, group's status and assigned user details.
    async updateCustomerGroupStatus(req) {
        try {
            let table_name = req.user.table_prefix;
            let input = req.body;

            const [update_group_status, fields] = await connectPool.query(
                `UPDATE ${table_name}customer_entries 
          SET 
            group_id = ?, 
            status_id = ?, 
            assign_user_id = ?, 
            updated_at = ? 
          WHERE id = ?`,
                [
                    input.group_id,
                    input.status_id,
                    input.assign_user_id,
                    getCurrentTime(),
                    req.params.id,
                ]
            );
            return update_group_status;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update Customer details.
    async updateCustomerDetails(req, filenames) {
        try {
            let table_name = req.user.table_prefix;
            let input = req.body;

            const [get_data, get_fields] = await connectPool.query(
                `SELECT id from ${table_name}customer_entries WHERE id = ?`,
                [req.params.id]
            );

            if (get_data.length === 1) {
                const [update_customer_entry, update_fields] =
                    await connectPool.query(
                        `UPDATE ${table_name}customer_entries SET
            first_name = ?,
            last_name = ?,
            email = ?,
            phone = ?,
            address = ?,
            postal_code = ?,
            city = ?,
            country = ?,
            state = ?,
            group_id = ?, 
            status_id = ?,
            notes= ?,
            updated_at = ?
            WHERE id = ?`,
                        [
                            input.first_name,
                            input.last_name,
                            input.email,
                            input.phone,
                            input.address,
                            input.postal_code,
                            input.city,
                            input.country,
                            input.state,
                            input.group_id,
                            input.status_id,
                            input.notes,
                            getCurrentTime(),
                            req.params.id,
                        ]
                    );

                const [check_customer_note, check_fields] =
                    await connectPool.query(
                        `SELECT * from ${table_name}customer_notes WHERE customer_id = ? AND main_note = 1`,
                        [req.params.id]
                    );

                if (check_customer_note.length === 0) {
                    if (input.notes) {
                        let notesData = {
                            customer_id: req.params.id,
                            user_id: input.user_id,
                            notes: input.notes,
                            main_note: 1,
                            created_at: getCurrentTime(),
                        };
                        const [insert_notes, fields] = await connectPool.query(
                            `INSERT into ${table_name}customer_notes SET ?`,
                            notesData
                        );

                        return insert_notes;
                    }
                } else {
                    const [update_customer_note, fields] =
                        await connectPool.query(
                            `UPDATE ${table_name}customer_notes SET notes = ?, updated_at = ? WHERE main_note = 1 AND customer_id = ?`,
                            [input.notes, getCurrentTime(), req.params.id]
                        );

                    return update_customer_note;
                }
            }

            return get_data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Delete customer entry and its all details from database.
    async deleteCustomerEntry(req) {
        try {
            let table_name = req.user.table_prefix;

            let data = [{ id: req.params.id }];
            await this.deleteCustomerData(table_name, data);

            return true;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all Customer Details.
    async view_customer_detail(req) {
        try {
            let table_name = req.user.table_prefix;

            const [view_customer, view_fields] = await connectPool.query(
                `SELECT a.*,b.id as eventID from ${table_name}customer_entries as a 
                left join ${table_name}customer_events as b
                on a.id = b.customer_id
                  WHERE a.id = ?`,
                [req.params.id]
            );
            if (view_customer.length > 0) {
                return view_customer[0];
            } else {
                return [];
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetching all customer notes according to customer id.
    async getNotesByCustomerId(req) {
        try {
            let table_name = await req.user.table_prefix;
            const [get_notes, fields] = await connectPool.query(
                `SELECT b.*,c.username FROM ${table_name}customer_entries AS a
            LEFT JOIN ${table_name}customer_notes AS b 
         ON a.id = b.customer_id 
            LEFT JOIN users AS c
         ON c.id = b.user_id
            WHERE b.customer_id = ? ORDER BY main_note desc`,
                [req.params.id]
            );

            return get_notes;
        } catch (e) {
            console.log();
            throw new Error(e);
        }
    }

    // Fetching all customer documents according to customer id.
    async getDocsByCustomerById(req) {
        try {
            let table_name = await req.user.table_prefix;
            const [customer_docs, fields] = await connectPool.query(
                `SELECT b.*, c.username from ${table_name}customer_entries as a 
            LEFT JOIN ${table_name}customer_documents as b 
         ON b.customer_id = a.id
            LEFT JOIN users AS c
         ON c.id = b.user_id
            WHERE b.customer_id = ?`,
                [req.params.id]
            );

            return customer_docs;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Add New notes each customer.
    async addNotesByUser(req) {
        try {
            let input = await req.body;
            let data = {
                customer_id: input.customer_id,
                user_id: input.user_id,
                notes: input.notes,
                main_note: 0,
                created_at: getCurrentTime(),
            };
            const [insert_notes, fields] = await connectPool.query(
                `INSERT into ${req.user.table_prefix}customer_notes SET ?`,
                data
            );

            return insert_notes;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetch single notes details by its id.
    async readNoteById(req) {
        try {
            const [rows_note] = await connectPool.query(
                `SELECT * from ${req.user.table_prefix}customer_notes WHERE id = ?`,
                [req.params.id]
            );

            return rows_note;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update each single note by its id.
    async updateNotesById(req) {
        try {
            let input = await req.body;
            let table_name = req.user.table_prefix;

            const [check_main_note, check_fields] = await connectPool.query(
                `SELECT main_note from ${table_name}customer_notes WHERE id = ?`,
                [req.params.id]
            );

            if (check_main_note[0].main_note === 1) {
                const [update_notes, fields] = await connectPool.query(
                    `UPDATE ${table_name}customer_notes SET notes = ?, updated_at = ? WHERE id = ?`,
                    [input.notes, getCurrentTime(), req.params.id]
                );
                if (update_notes) {
                    const [update_customer_note, fields] =
                        await connectPool.query(
                            `UPDATE ${table_name}customer_entries SET notes = ?, updated_at = ? WHERE id = ?`,
                            [input.notes, getCurrentTime(), input.customer_id]
                        );
                    return update_customer_note;
                }
            } else {
                const [update_notes, fields] = await connectPool.query(
                    `UPDATE ${table_name}customer_notes SET notes = ?, main_note = 0, updated_at = ? WHERE id = ?`,
                    [input.notes, getCurrentTime(), req.params.id]
                );

                return update_notes;
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Delete each single note by its id.
    async deleteNotesById(req) {
        try {
            const [delete_notes, fields] = await connectPool.query(
                `DELETE from ${req.user.table_prefix}customer_notes WHERE id = ?`,
                [req.params.id]
            );

            return delete_notes;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Add new documents for each customer.
    async addDocsByUser(req, filenames) {
        try {
            let input = await req.body;
            let i = 0;
            let docsUpload = [];
            while (i < filenames.length) {
                let data = {
                    customer_id: input.customer_id,
                    user_id: input.user_id,
                    filename: filenames[i].filename,
                    original_name: filenames[i].original_name,
                    created_at: getCurrentTime(),
                };

                const [insert_docs, fields] = await connectPool.query(
                    `INSERT into ${req.user.table_prefix}customer_documents SET ?`,
                    data
                );
                docsUpload.push(insert_docs[i]);
                i++;
            }
            return docsUpload;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetch single Documents details by its id.
    async readDocById(req) {
        try {
            const [rows_docs] = await connectPool.query(
                `SELECT * from ${req.user.table_prefix}customer_documents WHERE id = ?`,
                [req.params.id]
            );

            return rows_docs;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Update each document by its id.
    async updateDocsByById(req, filename) {
        try {
            let table_name = await req.user.table_prefix;
            const [rows_docs, docs_fields] = await connectPool.query(
                `SELECT * from ${table_name}customer_documents WHERE id = ?`,
                [req.params.id]
            );

            if (rows_docs.length === 1) {
                const [update_docs, fields] = await connectPool.query(
                    `UPDATE ${table_name}customer_documents SET filename = ? WHERE id = ?`,
                    [filename, req.params.id]
                );

                if (update_docs) {
                    unlinkFiles(`uploads/${rows_docs[0].filename}`);
                }
                return update_docs;
            }
            return rows_docs;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Delete each document by its id.
    async deleteDocById(req) {
        try {
            const [rows_docs, docs_fiels] = await connectPool.query(
                `SELECT filename from ${req.user.table_prefix}customer_documents WHERE id = ?`,
                [req.params.id]
            );
            const [delete_docs, fields] = await connectPool.query(
                `DELETE from ${req.user.table_prefix}customer_documents WHERE id = ?`,
                [req.params.id]
            );

            if (delete_docs) {
                unlinkFiles(`uploads/${rows_docs[0].filename}`);
                return delete_docs;
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Assigning group and status to customer.
    async assignStatus(req) {
        try {
            let table_name = await req.user.table_prefix;
            const [rows_customer, fields] = await connectPool.query(
                `SELECT * from ${table_name}customer_entries WHERE id = ?`,
                [req.body.id]
            );

            if (rows_customer.length === 1) {
                const [update_customer, fields] = await connectPool.query(
                    `UPDATE ${table_name}customer_entries SET group_id = ?, status_id = ? WHERE id = ?`,
                    [req.body.group_id, req.body.status_id, req.body.id]
                );
                return update_customer;
            }
            return rows_customer;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Assigning user to customer.
    async assignUser(req) {
        try {
            let table_name = await req.user.table_prefix;
            const [rows_customer, fields] = await connectPool.query(
                `SELECT * from ${table_name}customer_entries WHERE id = ?`,
                [req.body.id]
            );

            if (rows_customer.length === 1) {
                const [update_customer, fields] = await connectPool.query(
                    `UPDATE ${table_name}customer_entries SET  assign_user_id = ? WHERE id = ?`,
                    [req.body.assign_user_id, req.body.id]
                );

                return update_customer;
            }
            return rows_customer;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
    // Fetching all User list.
    async userList(req) {
        try {
            let id = req.user.parent;
            if (id === null || id === undefined || id === 0) id = req.user.id;
            const [rows_customer, fields] = await connectPool.query(
                `SELECT id,username from users WHERE (parent = ? or id = ? ) and is_delete = 0`,
                [id, id]
            );
            //   rows_customer.push(req.user);
            return rows_customer;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Delete Customer Documents & Notes function.
    async deleteCustomerData(table_name, data) {
        try {
            if (data.length > 0) {
                let c_ids = await data.map((x) => x.id).toString();
                const [get_docs_name, fields_docs] = await connectPool.query(
                    `SELECT filename from ${table_name}customer_documents WHERE customer_id IN (${c_ids})`
                );

                const [delete_customer, fields_cust] = await connectPool.query(
                    `DELETE FROM ${table_name}customer_entries WHERE id IN (${c_ids})`
                );

                const [delete_customer_docs, fields_delete_docs] =
                    await connectPool.query(
                        `DELETE from ${table_name}customer_documents WHERE customer_id IN (${c_ids})`
                    );

                const [delete_customer_notes, fields_delete_notes] =
                    await connectPool.query(
                        `DELETE from ${table_name}customer_notes WHERE customer_id IN (${c_ids})`
                    );

                const [delete_customer_events, fields_delete_events] =
                    await connectPool.query(
                        `DELETE from ${table_name}customer_events WHERE customer_id IN (${c_ids})`
                    );

                let i = 0;
                if (get_docs_name.length > 0) {
                    while (i < get_docs_name.length) {
                        unlinkFiles(`uploads/${get_docs_name[i].filename}`);
                        i++;
                    }
                }
            }
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
}

module.exports = new Customer();
