const express = require("express");
const router = express.Router();
const { getSession, clearSession } = require("../controllers/sessionController");
const checkJwt = require("../middleware/auth");

router.get("/", checkJwt, getSession);
router.delete("/", checkJwt, clearSession);

module.exports = router;