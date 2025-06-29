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
          if (user) {
            if (!user.linkToken) {
              user.linkToken = generateToken();
              await user.save();
            }
              // ✅ هنا نعمل التشييك اللي انت عايزه
            if (user.deletionRequested) {
            user.deletionRequested = false;
            await user.save();
            console.log('✅ تم استعادة الحساب وإلغاء طلب الحذف');
            }
          } else {
            // لو ما فيش مستخدم، نعمل واحد جديد
            user = new User({
              googleId: profile.id,
              email,
              name: profile.displayName,
              imageUrl: profile.photos[0].value,
              linkToken: generateToken(), // هنا لازم تولد التوكن
            });
            await user.save();
          }


        // عندما نجد المستخدم أو نقوم بإنشائه، نمرر بيانات المستخدم إلى done
        return done(null, user); // هذا يعني أن المصادقة تمت بنجاح
      } catch (err) {
        return done(err, null); // إذا كان هناك خطأ أثناء عملية البحث أو الإنشاء
      }
    }
  )
);
function generateToken() {
  return Math.random().toString(36).substring(2, 14);
}

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
// دالة تسجيل الخروج
const logoutUser =function(req, res) {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
}



// Callback بعد أن يوافق المستخدم على تسجيل الدخول عبر Google
const googleCallbackFail = passport.authenticate("google", { failureRedirect: "http://localhost:3001/index.html" });

const googleCallbackSuccess = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if(req.user.hasAnsweredQuiz) {
  res.send(`
    <script>
      // خزن إن المستخدم سجل دخول
      localStorage.setItem('loggedIn', 'true');
      // روح على الداشبورد
      window.location.href = "https://know-me-frontend-swart.vercel.app/profile.html";
    </script>
  `);  }else {
    res.send(`
      <script>
        // خزن إن المستخدم سجل دخول
        localStorage.setItem('loggedIn', 'true');
        // روح على الداشبورد
        window.location.href = "https://know-me-frontend-swart.vercel.app/dashboard.html";
      </script>
    `);
  }

};













// تصدير الـ controller و passport setup
module.exports = {
  googleLogin,
  googleCallbackFail,
  googleCallbackSuccess,
  logoutUser
};
