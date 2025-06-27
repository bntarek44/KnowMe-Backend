const express = require("express");
const router = express.Router();
const DataController = require("./controllers/Data"); // استيراد الكونترولر الخاص بالمستخدم
const UserController = require("./controllers/User"); // استيراد الكونترولر الخاص بالمستخدم
const {ensureAuth} = require("./middleWare");  // استيراد الميدلوير الخاص بالمصادقة



router.get("/google",UserController.googleLogin) ;
router.get("/logout",UserController.logoutUser) ;
router.get("/google/callback",UserController.googleCallbackFail,
  UserController.googleCallbackSuccess
);
//  بنتأكد من وجود اليوزر وبعدين نبغت بياناته عشان رسالة الترحيب
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    // لو المستخدم مسجل دخول
  res.json({
  user: {
    name: req.user.name,
    email: req.user.email,
    photo: req.user.imageUrl,
    createdAt: req.user.createdAt,
  }
});
  } else {
    // لو مش مسجل دخول
    res.json({ user: null });
  }
});
  // بنتأكد من وجود اليوزر قبل م نحفظ البيانات 
router.post("/data" ,ensureAuth, DataController.dataStorage);







module.exports = router;
