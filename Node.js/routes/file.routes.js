const router = require("express").Router();

const validateBody = require("../filters/validate.body");
const File = require("../models/file");
const fileController = require("../controllers/file.controller");
module.exports = router;

router.post("/", validateBody(File), fileController.post);
router.post("/delete", validateBody(File), fileController.del);
