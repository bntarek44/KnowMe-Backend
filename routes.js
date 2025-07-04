const express = require("express");
const router = express.Router();
const DataController = require("./controllers/Data"); // استيراد الكونترولر الخاص بالمستخدم
const UserController = require("./controllers/User"); // استيراد الكونترولر الخاص بالمستخدم
const DeleteController = require("./controllers/DeleteAccount"); // استيراد الكونترولر الخاص بالمستخدم
const QuizController = require("./controllers/quiz"); // استيراد الكونترولر الخاص بالاختبارات
const {ensureAuth} = require("./middleWare");  // استيراد الميدلوير الخاص بالمصادقة


// ميدل وير عشان يحفظ التوكن ف دالة الذهاب لصفحة الكويز بعد اللوجين
router.get('/google', (req, res, next) => {
  req.session.quizToken = req.query.state || req.query.token ;
  console.log('✅ Saved quizToken in session:', req.session.quizToken);
  next();
}, UserController.googleLogin);





router.get("/logout",UserController.logoutUser) ;
router.get("/google/callback",UserController.googleCallbackFail,
  UserController.googleCallbackSuccess
);
//  بنتأكد من وجود اليوزر وبعدين نبغت بياناته عشان رسالة الترحيب
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.imageUrl,
        createdAt: req.user.createdAt,
        linkToken: req.user.linkToken
      }
    });
  } else {
    res.json({ user: null });
  }
});

  // بنتأكد من وجود اليوزر قبل م نحفظ البيانات 
router.post("/data" ,ensureAuth, DataController.dataStorage);
// طلب حذف الحساب
router.delete('/request-delete', ensureAuth,DeleteController.requestDeletion);
// ارسال البيانات بتاع الاجابات عشان نملاها تلقائي لدالة التعديل
router.get("/data",ensureAuth,DataController.getData);
// لارسال اسم مالك التحدي
router.get("/quiz/owner",QuizController.ownerName);
// لتخزين الاجابات
router.post("/quiz/answer",QuizController.answerStorage);







module.exports = router;
