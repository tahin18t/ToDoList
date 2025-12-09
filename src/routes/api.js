const express = require("express");
const ProfileController = require("../controllers/ProfileController");
const ToDoListController = require("../controllers/ToDoListController")
const AuthVerifyMiddleware = require("../middleware/AuthVerifyMiddleware");
const router = express.Router();

router.post("/createProfile",ProfileController.CreateProfile)  // /api/v1/createProfile
router.post("/UserLogin", ProfileController.UserLogin);
router.get("/SelectProfile", AuthVerifyMiddleware, ProfileController.SelectProfile);
router.post("/UpdateProfile", AuthVerifyMiddleware, ProfileController.UpdateProfile);

router.post("/CreateToDo", AuthVerifyMiddleware, ToDoListController.CreateToDo);
router.get("/ToDoList", AuthVerifyMiddleware, ToDoListController.ListToDo);
router.post("/UpdateToDo", AuthVerifyMiddleware, ToDoListController.UpdateToDo);
router.post("/UpdateStatus", AuthVerifyMiddleware, ToDoListController.UpdateStatus);
router.delete("/RemoveToDo", AuthVerifyMiddleware, ToDoListController.RemoveToDo)
router.get("/SelectToDoByStatus", AuthVerifyMiddleware, ToDoListController.SelectToDoByStatus)
router.get("/SelectToDoByDate", AuthVerifyMiddleware, ToDoListController.SelectToDoByDate)

module.exports = router;