import { Router, Request, Response, NextFunction } from "express";
import * as workspaceController from "../../controllers/workspaceController"
import { workspaceIdValidator } from "../../middlewares/workspaceIdValidator";
import { workspaceFinder } from "../../middlewares/workspaceFinder";
import { validationResult } from "express-validator";

const router = Router();

const validated = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: errors.array()});
    }
    next();
}

router.get("/", workspaceController.getWorkspaces);
router.post("/create", workspaceController.validator.postCreateWorkspace, validated, workspaceController.postCreateWorkspace);

router.use("/:workspaceId", workspaceIdValidator);
router.use("/:workspaceId", workspaceFinder);
router.put("/:workspaceId", workspaceController.validator.putRenameWorkspace, validated, workspaceController.putRenameWorkspace);
router.delete("/:workspaceId", workspaceController.deleteWorkspace);
router.get("/:workspaceId/sensors", workspaceController.getWorkspaceSensors);
router.get("/:workspaceId/generateSubmissionId", workspaceController.getGenerateSubmissionId);

module.exports = router;