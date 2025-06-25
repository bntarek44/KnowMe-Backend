const express = require("express");
const router = express.Router();
const DataController = require("./controllers/Data"); // استيراد الكونترولر الخاص بالمستخدم
const UserController = require("./controllers/User"); // استيراد الكونترولر الخاص بالمستخدم
const {ensureAuth} = require("./middleWare");  // استيراد الميدلوير الخاص بالمصادقة



router.get("/google",UserController.googleLogin) ;
router.get("/google/callback",UserController.googleCallbackFail,
  UserController.googleCallbackSuccess
);
// بنتأكد من وجود اليوزر وبعدين نبغت اسمه عشان رسالة الترحيب
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    // لو المستخدم مسجل دخول
    res.json({ user: req.user });
  } else {
    // لو مش مسجل دخول
    res.json({ user: null });
  }
});
  // بنتأكد من وجود اليوزر قبل م نحفظ البيانات 
router.post("/data" ,ensureAuth, DataController.dataStorage);







module.exports = router;
