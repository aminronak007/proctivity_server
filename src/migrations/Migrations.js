const CreateMigrationTable = require("./CreateMigrationTable");
const CreateUserAndTokenTable = require("./CreateUserAndTokenTable");
const AlterCreateUserTable = require("./AlterCreateUserTable");
const AlterCreateUserTable1 = require("./AlterCreateUserTable1");
const CreatePackageTable = require("./CreatePackageTable");
const AddCurrentPackageIdInUsersTable = require("./AddCurrentPackageIdInUsersTable");
const CreateUserPackagesTable = require("./CreateUserPackagesTable");
const AlterCardDetailsUsersTable = require("./AlterCardDetailsUsersTable");
const AlterCardDetailsColumnsUserTable = require("./AlterCardDetailsColumnsUserTable");
const AlterAddressDetailsUserTable = require("./AlterAddressDetailsUserTable");
const AddSubscriptionIdInUserPackagesTable = require("./AddSubscriptionIdInUserPackagesTable");
const AddStripeFieldsInUsersTable = require("./AddStripeFieldsInUsersTable");
const CreateFeaturesTable = require("./CreateFeaturesTable");
const AlterPackageTable = require("./AlterPackageTable");
const CreateWebhookLogs = require("./CreateWebhookLogs");
const AlterPhoneFieldUserTable = require("./AlterPhoneFieldUserTable");
const UserMigrationsTable = require("./UserMigrationsTable");

const AlterCreateUserTableAccessKey = require("./AlterCreateUserTableAccessKey");
const AddStatusFieldInUserTable = require("./AddStatusFieldInUserTable");
const CreateModulesTable = require("./CreateModulesTable");
const AlterUserPackageTable = require("./AlterUserPackageTable");
const CreateSubUserPaymentHistoryTable = require("./CreateSubUserPaymentHistoryTable");
const AddExtraFieldsInUserPackagesTable = require("./AddExtraFieldsInUserPackagesTable");
const AlterAddIsDeleteFieldUserTable = require("./AlterAddIsDeleteFieldUserTable");
const AddSubscriptionItemIdInUsersTable = require("./AddSubscriptionItemIdInUsersTable");
const CreateSettingsTable = require("./CreateSettingsTable");
const AddIsRequestUserTrialTable = require("./AddIsRequestUserTrialTable");
const AddStripeCredentialsUsersTable = require("./AddStripeCredentialsUsersTable");
const AddWebhookIdAndProctivityAccountIdUsersTable = require("./AddWebhookIdAndProctivityAccountIdUsersTable");
const CreateInvoceChrgeTable = require("./CreateInvoceChrgeTable");
const AddCommissionSettingsTable = require("./AddCommissionSettingsTable");
class Migrations {
    constructor() {}

    async migrate(req, res) {
        await CreateMigrationTable.create();
        await CreateUserAndTokenTable.create();
        await AlterCreateUserTable.alter();
        await CreatePackageTable.create();
        await AlterCreateUserTable1.alter();
        await AddCurrentPackageIdInUsersTable.alter();
        await CreateUserPackagesTable.create();
        await AlterCardDetailsUsersTable.alter();
        await AlterCardDetailsColumnsUserTable.alter();
        await AlterAddressDetailsUserTable.alter();
        await AddSubscriptionIdInUserPackagesTable.alter();
        await AddStripeFieldsInUsersTable.alter();
        await CreateFeaturesTable.create();
        await AlterPackageTable.alter();
        await CreateWebhookLogs.create();
        await AlterPhoneFieldUserTable.alter();
        await UserMigrationsTable.user_migrations();
        await AlterCreateUserTableAccessKey.alter();
        await AddStatusFieldInUserTable.alter();
        await CreateModulesTable.create();
        await AlterUserPackageTable.alter();
        await CreateSubUserPaymentHistoryTable.create();
        await AddExtraFieldsInUserPackagesTable.alter();
        await AlterAddIsDeleteFieldUserTable.alter();
        await AddSubscriptionItemIdInUsersTable.alter();
        await CreateSettingsTable.create();
        await AddIsRequestUserTrialTable.alter();
        await AddStripeCredentialsUsersTable.alter();
        await AddWebhookIdAndProctivityAccountIdUsersTable.alter();
        await CreateInvoceChrgeTable.create();
        await AddCommissionSettingsTable.alter();
        res.send(["Migrated"]);
    }
}

module.exports = new Migrations();
