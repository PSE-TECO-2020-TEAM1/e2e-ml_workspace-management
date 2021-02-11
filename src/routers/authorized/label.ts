import { Router } from "express";
import * as labelController from "../../controllers/labelController";
import { labelIdValidator } from "../../middlewares/labelIdValidator";
import { labelFinder } from "../../middlewares/labelFinder";

const router = Router();

router.get("/", labelController.getLabels);
router.post("/create", labelController.postCreateLabel);

router.use("/:labelId", labelIdValidator);
router.use("/:labelId", labelFinder);

router.put("/:labelId/rename", labelController.putRenameLabel);
router.put("/:labelId/describe", labelController.putDescribeLabel);
router.delete("/:labelId", labelController.deleteLabel);

module.exports = router;
