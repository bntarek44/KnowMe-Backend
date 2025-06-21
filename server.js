require("dotenv").config(); // حمّل .env في الأول
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require("cors");
const UserRouter = require("./routes");
const passport = require("passport");
const session = require("express-session");

// ✅ ترتيب الميدلوير مهم
app.use(cors({
  origin: 'https://know-me-frontend-git-master-bntarek44s-projects.vercel.app',
  credentials: true,
}));

app.use(express.json());
app.set('trust proxy', 1); // ✨ مهم جداً لتمرير الكوكيز في الإنتاج
    // إعداد الجلسة و passport
app.use(session({
  secret: process.env.Session_Secret,
  resave: false,
  saveUninitialized: false, // مهم جداً
  cookie: {
    secure: true,
    sameSite: 'none' // ✨ مهم لتخطي المشاكل في cross-origin
  }
}));

app.use(passport.initialize());
app.use(passport.session());


// ✅ use routes
app.use('/auth', UserRouter);  // هنغير في routes كمان تبع ده

// ✅ fallback 404
app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});


// ✅ MongoDB connection
mongoose.connect(process.env.DB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error('❌ MongoDB connection failed:', err));




// ✅ start server
const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
}).on('error', (err) => {
  console.error("❌ Server failed to start:", err.message);
});

