const router = require("express").Router();
const CustomerController = require("../controller/CustomerController");
const auth = require("../middleware/auth");
const subscriptionCheck = require("../middleware/subscription_check");

const { upload } = require("../middleware/multer");

// Customer CRUD
router.post(
  "/customer/add/details",
  auth,
  subscriptionCheck,
  upload.fields([{ name: "customer_files" }, { name: "customer_images" }]),
  CustomerController.addCustomerDetails
);
router.post(
  "/customer/list",
  auth,
  subscriptionCheck,
  CustomerController.getCustomerList
);

router.post(
  "/customer/groups/status",
  auth,
  subscriptionCheck,
  CustomerController.getStatusByGroupId
);

router.put(
  "/customer/update/group-status/:id",
  auth,
  subscriptionCheck,
  CustomerController.updateCustomerGroupStatus
);

router.put(
  "/customer/update/details/:id",
  auth,
  subscriptionCheck,
  CustomerController.updateCustomerDetails
);

router.delete(
  "/customer/delete/:id",
  auth,
  subscriptionCheck,
  CustomerController.deleteCustomerEntry
);

router.get(
  "/customer/:id/view",
  auth,
  subscriptionCheck,
  CustomerController.ViewCustomerEntry
);
router.get(
  "/customer/notes/:id",
  auth,
  subscriptionCheck,
  CustomerController.getNotesByCustomerById
);

router.get(
  "/customer/docs/:id",
  auth,
  subscriptionCheck,
  CustomerController.getDocsByCustomerById
);

// Notes CRUD
router.post(
  "/customer/add/notes",
  auth,
  subscriptionCheck,
  CustomerController.addNotesByUser
);
router.get(
  "/customer/read/note/:id",
  auth,
  subscriptionCheck,
  CustomerController.readNoteById
);
router.put(
  "/customer/update/notes/:id",
  auth,
  subscriptionCheck,
  CustomerController.updateNotesById
);
router.delete(
  "/customer/delete/notes/:id",
  auth,
  subscriptionCheck,
  CustomerController.deleteNotesById
);

// Docs CRUD
router.post(
  "/customer/add/doc",
  auth,
  subscriptionCheck,
  upload.fields([{ name: "customer_docs" }]),
  CustomerController.addDocsByUser
);
router.get(
  "/customer/read/docs/:id",
  auth,
  subscriptionCheck,
  CustomerController.readDocById
);
router.put(
  "/customer/update/doc/:id",
  auth,
  subscriptionCheck,
  upload.single("customer_docs"),
  CustomerController.updateDocsById
);
router.delete(
  "/customer/delete/doc/:id",
  auth,
  subscriptionCheck,
  CustomerController.deleteDocById
);
router.post(
  "/customer/add/event",
  auth,
  subscriptionCheck,
  CustomerController.AddCustomerEvent
);
router.put(
  "/customer/event/:id/edit",
  auth,
  CustomerController.UpdateCustomerEvent
);
router.post(
  "/customer/event/get",
  auth,
  subscriptionCheck,
  CustomerController.GetCustomerEvent
);
router.delete(
  "/customer/event/:id/delete",
  auth,
  subscriptionCheck,
  CustomerController.DeleteCustomerEvent
);
router.put(
  "/customer/assign-status",
  auth,
  subscriptionCheck,
  CustomerController.assignStatus
);

router.put(
  "/customer/assign-user",
  auth,
  subscriptionCheck,
  CustomerController.assignUser
);

router.get(
  "/customer/user-list",
  auth,
  subscriptionCheck,
  CustomerController.userList
);

module.exports = router;
