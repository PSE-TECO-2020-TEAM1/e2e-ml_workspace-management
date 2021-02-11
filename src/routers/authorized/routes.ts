import { Router } from "express";
import { authenticate } from "../../auth/authentication";

const workspace = require("./workspace");
const sample = require("./sample");
const label = require("./label");

const router = Router();

router.use("/workspaces", authenticate);
router.use("/workspaces", workspace);
router.use("/workspaces/:workspaceId/labels", label);
router.use("/workspaces/:workspaceId/samples", sample);

module.exports = router;
