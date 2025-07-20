require("dotenv").config(); // حمّل .env في الأول
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require("cors");
const UserRouter = require("./routes");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cron = require('node-cron');
const { deleteExpiredAccounts } = require('./controllers/DeleteAccount');

// ✅ ترتيب الميدلوير مهم
app.use(cors({
  origin: 'https://know-me-frontend-swart.vercel.app',
  credentials: true,
}));

app.use(express.json());


// لو في production (زي Vercel/Railway) لازم نثق في البروكسي عشان secure cookies تشتغل
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: process.env.Session_Secret,
  resave: false,
  saveUninitialized: false,
  rolling: true, // ✅ مهم لتجديد السيشن تلقائيًا مع كل request
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60, // ✅ جلسة لمدة ساعة (بالمللي ثانية)
    secure: process.env.NODE_ENV === 'production', // ✅ https only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  }
}));


// if (process.env.NODE_ENV === 'production') {
//   app.set('trust proxy', 1);
// }

// app.use(session({
//   secret: process.env.Session_Secret,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
//   }
// }));



app.use(passport.initialize());
app.use(passport.session());


// دالة دورية لحذف الحسابات المؤجلة
cron.schedule('0 0 * * *', async () => {
  console.log('🕛 Cron Job Running: Deleting expired accounts...');
  await deleteExpiredAccounts();
  console.log('✅ Cron Job Finished: Expired accounts deleted.');
});

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

