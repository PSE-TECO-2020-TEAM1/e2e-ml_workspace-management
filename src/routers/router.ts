import { Router } from "express";

const router = Router();
const authorized = require("./authorized/routes");
const unauthorized = require("./unauthorized/routes");

router.use(unauthorized);
router.use(authorized);

module.exports = router;