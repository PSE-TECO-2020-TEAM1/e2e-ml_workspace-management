import { Router } from "express";
import * as workspaceController from "../controllers/workspaceController"
import * as labelController from "../controllers/labelController";
import * as sampleController from "../controllers/sampleController";
import { workspaceIdValidator } from "../middlewares/workspaceIdValidator";
import { workspaceFinder } from "../middlewares/workspaceFinder";
import { labelIdValidator } from "../middlewares/labelIdValidator";
import { labelFinder } from "../middlewares/labelFinder";
import { sampleIdValidator } from "../middlewares/sampleValidator";
import { sampleFinder } from "../middlewares/sampleFinder";
import { authenticate } from "../auth/authentication";

const router = Router();

router.use(authenticate);
router.post("/workspaces/create", workspaceController.postCreateWorkspace);
router.get("/workspaces", workspaceController.getWorkspaces);

router.use("/workspaces/:workspaceId", workspaceIdValidator);
router.use("/workspaces/:workspaceId", workspaceFinder);

router.put("/workspaces/:workspaceId", workspaceController.putRenameWorkspace);
router.delete("/workspaces/:workspaceId", workspaceController.deleteWorkspace);
router.get("/workspaces/:workspaceId/sensors", workspaceController.getWorkspaceSensors);
router.get("/workspaces/:workspaceId/labels", labelController.getLabels);
router.post("/workspaces/:workspaceId/labels/create", labelController.postCreateLabel);
router.get("/workspaces/:workspaceId/generateSubmissionId", workspaceController.getGenerateSubmissionId);
router.get("/workspaces/:workspaceId/samples", sampleController.getSamples);

router.use("/workspaces/:workspaceId/labels/:labelId", labelIdValidator);
router.use("/workspaces/:workspaceId/labels/:labelId", labelFinder);

router.put("/workspaces/:workspaceId/labels/:labelId/rename", labelController.putRenameLabel);
router.put("/workspaces/:workspaceId/labels/:labelId/describe", labelController.putDescribeLabel);
router.delete("/workspaces/:workspaceId/labels/:labelId", labelController.deleteLabel);
router.post("/submitSample", sampleController.postSubmitSample);

router.use("/workspaces/:workspaceId/samples/:sampleId", sampleIdValidator);
router.use("/workspaces/:workspaceId/samples/:sampleId", sampleFinder);

router.get("/workspaces/:workspaceId/samples/:sampleId", sampleController.getSample);
router.delete("/workspaces/:workspaceId/samples/:sampleId", sampleController.deleteSample);
router.put("/workspaces/:workspaceId/samples/:sampleId/relabel", sampleController.putRelabelSample);
router.put("/workspaces/:workspaceId/samples/:sampleId/timeframes", sampleController.putChangeTimeFrames);

router.get("/submissionConfig", workspaceController.getSubmissionConfig);

module.exports = router;