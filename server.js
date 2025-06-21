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
  origin: 'https://know-me-frontend-swart.vercel.app',
  credentials: true,
}));

app.use(express.json());

// if (process.env.NODE_ENV === 'production') {
//   app.set('trust proxy', 1);
// }

app.use(express.json());    // إعداد الجلسة و passport
app.use(session({
  secret: process.env.Session_Secret,
  resave: false,
  saveUninitialized: false, // مهم جداً
  cookie: {
    secure: false,
    sameSite: 'lax' // ✨ مهم لتخطي المشاكل في cross-origin
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


    app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).send('Internal Server Error');
});




// ✅ start server
const server = app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
}).on('error', (err) => {
  console.error("❌ Server failed to start:", err.message);
});

