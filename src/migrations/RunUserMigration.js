const CreateUserPermissionsTable = require("./CreateUserPermissionsTable");
const CreateUserMarketingDataTable = require("./CreateUserMarketingDataTable");
const CreateGroupTable = require("./CreateGroupTable");
const CreateGroupStatusTable = require("./CreateGroupStatusTable");
const CreateCustomerEntryTable = require("./CreateCustomerEntryTable");
const CreateCustomerDocumentsTable = require("./CreateCustomerDocumentsTable");
const CreateCustomerNotesTable = require("./CreateCustomerNotesTable");
const CreateCustomerEventsTable = require("./CreateCustomerEventsTable");
const AddStripeCustomerIdInCustomerEntryTable = require("./AddStripeCustomerIdInCustomerEntryTable");
const CreateQuoteTable = require("./CreateQuoteTable");
const CreateQuoteItemsTable = require("./CreateQuoteItemsTable");
const CreateInvoiceTable = require("./CreateInvoiceTable");
class RunUserMigration {
    constructor() {}
    async runuserMigration(prefix) {
        if (prefix !== null && prefix !== undefined) {
            await CreateUserPermissionsTable.create(prefix);
            await CreateUserMarketingDataTable.create(prefix);
            await CreateGroupTable.create(prefix);
            await CreateGroupStatusTable.create(prefix);
            await CreateCustomerEntryTable.create(prefix);
            await CreateCustomerDocumentsTable.create(prefix);
            await CreateCustomerNotesTable.create(prefix);
            await CreateCustomerEventsTable.create(prefix);
            await AddStripeCustomerIdInCustomerEntryTable.alter(prefix);
            await CreateQuoteTable.create(prefix);
            await CreateQuoteItemsTable.create(prefix);
            await CreateInvoiceTable.create(prefix);
        }
    }
}
module.exports = new RunUserMigration();
