import { Router } from "express";
import { getSubmissionConfig } from "../../controllers/workspaceController"
import { postSubmitSample } from "../../controllers/sampleController";

const router = Router();

router.post("/submitSample", postSubmitSample);
router.get("/submissionConfig", getSubmissionConfig);

module.exports = router;