import { Router } from "express";
import * as sampleController from "../../controllers/sampleController";
import { sampleIdValidator } from "../../middlewares/sampleValidator";
import { sampleFinder } from "../../middlewares/sampleFinder";

const router = Router();

router.get("/", sampleController.getSamples);

router.use("/:sampleId", sampleIdValidator);
router.use("/:sampleId", sampleFinder);

router.get("/:sampleId", sampleController.getSample);
router.delete("/:sampleId", sampleController.deleteSample);
router.put("/:sampleId/relabel", sampleController.putRelabelSample);
router.put("/:sampleId/timeframes", sampleController.putChangeTimeFrames);

module.exports = router;
