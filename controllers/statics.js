const Answer = require('../models/answer');
// ترتيب الأصدقاء حسب النتيجة
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



// الاختبارات التي شاركت فيها
const getQuizesRanking = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // كل الأجوبة الخاصة بالاختبار اللي الناس جاوبوه لصاحب التوكن ده
    const answers = await Answer.find({ guestEmail: email });

    // ترتيب الأصدقاء
    const ranking = answers.map((a) => ({
      email: a.ownerEmail, // ممكن نستخدمه كمُعرّف
      name: a.ownerName || a.guestEmail?.split('@')[0],
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

module.exports = {getFriendsRanking,getQuizesRanking} ;