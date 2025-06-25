// استيراد الحزم المطلوبة
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // استيراد الموديل الخاص بالمستخدم
const dotenv = require("dotenv");
dotenv.config();

// إعداد passport للتعامل مع Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // هذا هو الـ Client ID الذي تحصل عليه من Google API
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // هذا هو الـ Client Secret
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // عنوان ال URL الذي يعيد توجيه المستخدم بعد المصادقة
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        // البحث عن المستخدم في قاعدة البيانات باستخدام البريد الإلكتروني
        let user = await User.findOne({ email});
        
        if (!user) {
          // إذا كان المستخدم غير موجود في قاعدة البيانات، نقوم بإنشائه
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value, // استخدام البريد الإلكتروني من Google
            name: profile.displayName, // الاسم من Google
            imageUrl: profile.photos[0].value, // صورة المستخدم
          });
          await user.save(); // حفظ المستخدم في قاعدة البيانات
        }

        // عندما نجد المستخدم أو نقوم بإنشائه، نمرر بيانات المستخدم إلى done
        return done(null, user); // هذا يعني أن المصادقة تمت بنجاح
      } catch (err) {
        return done(err, null); // إذا كان هناك خطأ أثناء عملية البحث أو الإنشاء
      }
    }
  )
);

// تخزين المستخدم في الجلسة (session)
passport.serializeUser((user, done) => {
  done(null, user.id); // نقوم بتخزين فقط الـ ID في الجلسة
});

// استرجاع المستخدم من الجلسة باستخدام الـ ID المخزن
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // البحث عن المستخدم باستخدام الـ ID
    done(null, user); // استرجاع بيانات المستخدم
  } catch (err) {
    done(err, null); // إذا كان هناك خطأ أثناء استرجاع المستخدم
  }
});

// Controller الخاص بتسجيل الدخول عبر Google
const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"], // الصلاحيات التي نطلبها من المستخدم
});

// Callback بعد أن يوافق المستخدم على تسجيل الدخول عبر Google
const googleCallbackFail = passport.authenticate("google", { failureRedirect: "/login" });
// const googleCallbackSuccess = (req, res) => {
//   // هنا الـ req.user هي بيانات المستخدم اللي تم الحصول عليها من Passport
//   if (!req.user) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   // عرض بيانات المستخدم في الـ API
  
//  res.redirect("http://localhost:3001/dashboard.html");

// }

const googleCallbackSuccess = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.send(`
    <script>
      // خزن إن المستخدم سجل دخول
      localStorage.setItem('loggedIn', 'true');
      // روح على الداشبورد
      window.location.href = "http://localhost:3001/dashboard.html";
    </script>
  `);
};













// تصدير الـ controller و passport setup
module.exports = {
  googleLogin,
  googleCallbackFail,
  googleCallbackSuccess,
};
