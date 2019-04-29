const express = require("express")
const storeController = require("../controllers/storeController")
const userController = require("../controllers/userController")
const authController = require("../controllers/authController")
const router = express.Router()
const {catchErrors} = require("../handlers/errorHandlers")

router.get("/", catchErrors(storeController.getStores))
router.get("/stores", catchErrors(storeController.getStores))
router.get("/store/:slug", catchErrors(storeController.getStore))
router.get("/store/:id/edit", catchErrors(storeController.editStore))
router.get("/add", authController.isLoggedIn, storeController.createStore)
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

router.get("/tags", storeController.getTags)
router.get("/tags/:tag", storeController.getTags)
router.get("/login", userController.loginForm)
router.post("/login", authController.login)
router.get("/register", userController.registerForm)
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login,
)
router.get("/logout", authController.logout)
router.get("/account", userController.account)
router.post("/account", catchErrors(userController.postAccount))
router.post("/account/forgot", authController.forgot)
router.post("/account/forgot", authController.forgot)
router.get(
  "/account/reset/:token",
  authController.validateToken,
  authController.reset,
)
router.post(
  "/account/reset/:token",
  authController.validateToken,
  catchErrors(authController.update),
)
router.get("/map", storeController.getMap)
//////////////////////////////////////////////////
// API
/////////////////////////////////////////////////
router.get("/api/search", catchErrors(storeController.searchStores))
router.get("/api/store/near", catchErrors(storeController.storeNearBy))

module.exports = router
