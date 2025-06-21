const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("./controller");


router.get("/google",UserController.googleLogin) ;

router.get("/google/callback",UserController.googleCallbackFail,
  UserController.googleCallbackSuccess
);

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    // لو المستخدم مسجل دخول
    res.json({ user: req.user });
    console.log("🔍 req.user:", req.user);
  } else {
    // لو مش مسجل دخول
    res.json({ user: null });
  }
});




module.exports = router;
