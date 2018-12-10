const router = require("express").Router();

const validateBody = require("../filters/validate.body");
const Asset = require("../models/asset");
const assetController = require("../controllers/asset.controller");
module.exports = router;

router.get("/:id(\\d+)", assetController.getById);
router.get("/:pageIndex(\\d+)/:pageSize(\\d+)/:businessId(\\d+)", assetController.getAll);
router.get("/:search/:pageIndex/:pageSize/:businessId(\\d+)", assetController.search);
router.get("/:businessId(\\d+)", assetController.getAll);
router.get("/businessId/:appUserId(\\d+)", assetController.getBusinessId);

router.post("/", validateBody(Asset), assetController.post);
router.put("/:id", validateBody(Asset), assetController.put);
router.delete("/:id", assetController.del);
