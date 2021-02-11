import { Router } from "express";
import * as workspaceController from "../../controllers/workspaceController"
import { workspaceIdValidator } from "../../middlewares/workspaceIdValidator";
import { workspaceFinder } from "../../middlewares/workspaceFinder";

const router = Router();

router.get("/", workspaceController.getWorkspaces);
router.post("/create", workspaceController.postCreateWorkspace);

router.use("/:workspaceId", workspaceIdValidator);
router.use("/:workspaceId", workspaceFinder);
router.put("/:workspaceId", workspaceController.putRenameWorkspace);
router.delete("/:workspaceId", workspaceController.deleteWorkspace);
router.get("/:workspaceId/sensors", workspaceController.getWorkspaceSensors);
router.get("/:workspaceId/generateSubmissionId", workspaceController.getGenerateSubmissionId);

module.exports = router;