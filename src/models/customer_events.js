const { getCurrentTime } = require("../helpers/helpers");
const moment = require("moment-timezone");
const monentDate = require("moment");
class CustomerEvents {
    constructor() {}

    // Add customer events to each customer.
    async add_customer_event(req) {
        try {
            let table_name = await req.user.table_prefix;
            let input = await req.body;
            let data = {
                customer_id: input.customer_id * 1,
                user_id: input.user_id,
                title: input.title,
                event_desc: input.desc,
                start_date: moment(input.start).format("YYYY-MM-DD hh:mm:ss"),
                end_date: moment(input.end).format("YYYY-MM-DD hh:mm:ss"),
                event_color: input.event_color,
                recurring_event: input.recurring_event,
                created_at: getCurrentTime(),
                updated_at: getCurrentTime(),
                added_by: req.user.id,
                updated_by: req.user.id,
            };

            const [check_customer_event, check_event] = await connectPool.query(
                `SELECT * from ${table_name}customer_events WHERE customer_id = ?`,
                [input.customer_id * 1]
            );

            if (check_customer_event.length === 0) {
                const [rows_customer_entries, add_fields] =
                    await connectPool.query(
                        `INSERT into ${table_name}customer_events SET ?`,
                        data
                    );
                if (rows_customer_entries) {
                    await connectPool.query(
                        `update ${table_name}customer_entries SET assign_user_id = ? where id = ?`,
                        [input.user_id, input.customer_id * 1]
                    );
                }
                return rows_customer_entries;
            }
            return check_customer_event;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }
    // Update each customer events by its id.
    async update_customer_event(req) {
        try {
            let table_name = await req.user.table_prefix;
            let input = await req.body;
            let data = {
                title: input.title,
                event_desc: input.desc,
                user_id: input.user_id,
                start_date: moment(input.start).format("YYYY-MM-DD hh:mm:ss"),
                end_date: moment(input.end).format("YYYY-MM-DD hh:mm:ss"),
                event_color: input.event_color,
                recurring_event: input.recurring_event,
                updated_at: getCurrentTime(),
                updated_by: req.user.id,
            };

            const [rows_customer_entries, add_fields] = await connectPool.query(
                `UPDATE ${table_name}customer_events SET ? WHERE id = ?`,
                [data, req.params.id]
            );
            if (rows_customer_entries) {
                await connectPool.query(
                    `update ${table_name}customer_entries SET assign_user_id = ? where id = ?`,
                    [input.user_id, input.customer_id * 1]
                );
            }

            return rows_customer_entries;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Fetch all customer event details.
    async get_customer_event(req) {
        try {
            let table_name = await req.user.table_prefix;
            let input = await req.body;
            let sql = `SELECT * FROM ${table_name}customer_events WHERE id IS NOT NULL  AND user_id = ${input.user_id}`;
            let eventArr = [];
            let result = [];
            let i = 0;
            const [customer_events, fields] = await connectPool.query(sql);
            if (customer_events.length > 0) {
                while (i < customer_events.length) {
                    const event = customer_events[i];
                    const eventObj = {
                        start: moment(event.start_date).toDate(),
                        end: moment(event.end_date).toDate(),
                        id: event.id,
                        title: event.title,
                        desc: event.event_desc,
                        event_color: event.event_color,
                        recurring_event: event.recurring_event,
                        allDay: false,
                        customer_id: event.customer_id,
                    };
                    if (event.recurring_event !== "") {
                        console.log("here");
                        eventArr = await this.getRecurringEvent(
                            event.recurring_event,
                            eventObj
                        );
                    }
                    console.log(eventArr, "eventArr");
                    result.push(eventObj, ...eventArr);
                    i++;
                }
            }

            return result;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Delete each customer event by its id.
    async delete_customer_event(req) {
        try {
            let table_name = await req.user.table_prefix;

            const [rows_customer_entries, add_fields] = await connectPool.query(
                `DELETE FROM ${table_name}customer_events WHERE id = ?`,
                [req.params.id]
            );

            return rows_customer_entries;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    // Get Recurring Event
    async getRecurringEvent(requrringType, event) {
        const eventArr = [];
        var x = 1;
        if (requrringType === "Yearly") {
            while (x <= 5) {
                eventArr.push({
                    ...event,
                    start: monentDate(event.start).add(x, "y"),
                    end: monentDate(event.end).add(x, "y"),
                });
                x++;
            }
        } else if (requrringType === "Monthly") {
            while (x <= 12) {
                eventArr.push({
                    ...event,
                    start: monentDate(event.start).add(x, "M"),
                    end: monentDate(event.end).add(x, "M"),
                });
                x++;
            }
        } else if (requrringType === "Weekly") {
            while (x <= 52) {
                eventArr.push({
                    ...event,
                    start: monentDate(event.start).add(x, "w"),
                    end: monentDate(event.end).add(x, "w"),
                });
                x++;
            }
        } else if (requrringType === "Bi-Weekly") {
            while (x <= 26) {
                eventArr.push({
                    ...event,
                    start: monentDate(event.start).add(x * 14, "d"),
                    end: monentDate(event.end).add(x * 14, "d"),
                });
                x++;
            }
        }
        return eventArr;
    }
}

module.exports = new CustomerEvents();
