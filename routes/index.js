const express = require("express")
const storeController = require("../controllers/storeController")
const router = express.Router()
const {catchErrors} = require("../handlers/errorHandlers")

// Do work here
router.get("/", catchErrors(storeController.getStores))
router.get("/stores", catchErrors(storeController.getStores))
router.get("/stores/:id/edit", catchErrors(storeController.editStore))

router.get("/add", storeController.createStore)
router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.addStore),
)
router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore),
)

module.exports = router
