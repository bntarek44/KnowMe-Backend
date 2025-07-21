const Answer = require('../models/answer');

const getFriendsRanking = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  try {
    // كل الأجوبة الخاصة بالاختبار اللي الناس جاوبوه لصاحب التوكن ده
    const answers = await Answer.find({ linkToken: token });

    // ترتيب الأصدقاء
    const ranking = answers.map((a) => ({
      email: a.guestEmail, // ممكن نستخدمه كمُعرّف
      name: a.guestName || a.guestEmail?.split('@')[0],
      total: a.totalQuestions,
      correct: a.correctAnswersCount,
      percentage: a.resultPercentage || 0,
      createdAt: a.createdAt
    }));

    // ترتيب تنازلي حسب النسبة
    ranking.sort((a, b) => b.percentage - a.percentage);

    res.json({ success: true, ranking });

  } catch (err) {
    console.error("❌ Error loading friends ranking:", err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {getFriendsRanking} ;