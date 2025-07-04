// استيراد الحزم المطلوبة
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // استيراد الموديل الخاص بالمستخدم
const Data = require("../models/Data"); // استيراد الموديل الخاص بالمستخدم
const dotenv = require("dotenv");
dotenv.config();

// إعداد passport للتعامل مع Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
  async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
// هنا 👇 حط السطر ده
       
// ابحث عن المستخدم
        let user = await User.findOne({ email });
        if (user) {
          if (!user.linkToken) {
            user.linkToken = generateToken();
            await user.save();
          }
          if (user.deletionRequested) {
            user.deletionRequested = false;
            await user.save();
            console.log('✅ تم استعادة الحساب وإلغاء طلب الحذف');
          }
        } else {
          // مستخدم جديد
          user = new User({
            googleId: profile.id,
            email,
            name: profile.displayName,
            imageUrl: profile.photos[0].value,
            linkToken: generateToken(),
          });
          await user.save();
        }


        // المصادقة ناجحة
        return done(null, user);
      } catch (err) {
        return done(err, null);
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
const googleLogin = (req, res, next) => {
  const options = {
    scope: ['profile', 'email']
  };
  if (req.session.quizToken) {
    options.state = req.session.quizToken;
  }
  passport.authenticate('google', options)(req, res, next);
};



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
const googleCallbackFail = passport.authenticate("google", { failureRedirect: "https://know-me-frontend-swart.vercel.app/index.html" });

const googleCallbackSuccess = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
    // 👇 لو جوجل رجعت state رجعه تاني للسيشن
  if (req.query.state) {
    req.session.quizToken = req.query.state;
  }

  // هل هو جاي من رابط فيه توكن تحدي؟ يعني ده صديق بيحل مش صاحب التحدي
  if (req.session.quizToken) {
     const quizToken = req.session.quizToken;
  delete req.session.quizToken;
    // خزن إنه سجل دخول
    res.send(`
      <script>
        localStorage.setItem('loggedIn', 'true');
        // روح على صفحة الكويز
        window.location.href = "https://know-me-frontend-swart.vercel.app/quiz.html?token=${quizToken}";
      </script>
    `);
    return;
  }
  
const ownerISAnswer = await Data.findOne({ user: req.user._id });

  // لو هو صاحب التحدي
  if (ownerISAnswer) {
    res.send(`
      <script>
        localStorage.setItem('loggedIn', 'true');
        // روح على البروفايل
        window.location.href = "https://know-me-frontend-swart.vercel.app/profile.html";
      </script>
    `);
  } else {
    res.send(`
      <script>
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
