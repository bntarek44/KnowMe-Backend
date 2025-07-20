const Answer = require('../models/answer');  // استورد الموديل اللي فوق
const User = require('../models/User');     // الموديل بتاع اليوزر
const Data = require('../models/Data');


// لارسال اسم اليوزر او صاحب الفورم حسب التوكن 
const ownerName = async function(req, res){
  const token = req.query.quizToken;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // ابحث عن المستخدم اللي رابطهم فيه التوكن ده
    const user = await User.findOne({ linkToken: token });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ name: user.name , id: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};




// لاستقبال الاجابات من صديق اليوزر وحفظها ف الداتا بيز

const answerStorage = async function(req, res) {
  try {
    const { token, answers, guestName, guestEmail } = req.body;

    // ✅ تأكد من البيانات المطلوبة
    if (!token || !answers || !guestName || !guestEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ تأكد إن التوكن يخص صاحب التحدي
    const owner = await User.findOne({ linkToken: token });
    if (!owner) {
      return res.status(404).json({ error: 'Invalid token / User not found' });
    }
    // نتأكد انه محلش الاختبار قبل كدة
    const existingAnswer = await Answer.findOne({
    guestEmail,
    linkToken: token  
    });

    if (existingAnswer) {
      return res.status(400).json({ message: 'You already submitted this quiz.' });
    }


    // ✅ احفظ الإجابة
    const newAnswer = new Answer({
      linkToken: token,
      answers,
      ownerEmail: owner.email,
      ownerName: owner.name,
      guestName,
      guestEmail
    });

    await newAnswer.save();

    res.json({ success: true, message: 'Answer saved successfully' });
  } catch (error) {
    console.error('Error saving quiz answer:', error);
    res.status(500).json({ error: 'Server error while saving answer' });
  }
};








const compareAnswersAndReturnResult = async function(req, res) {
  try {
    const { token, guestEmail } = req.body;


    if (!token || !guestEmail) {
      return res.status(400).json({ error: "Missing token or guest email" });
    }
    const guestAnswer = await Answer.findOne({ linkToken: token, guestEmail });

    if (!guestAnswer) {
      return res.status(404).json({ error: "Guest answer not found" });
    }

    const owner = await User.findOne({ linkToken: token });
    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }
    const ownerData = await Data.findOne({ user: owner._id });
    if (!ownerData || !ownerData.answers) {
      return res.status(404).json({ error: "Owner answers not found" });
    }

    const ownerAnswers = Object.fromEntries(ownerData.answers);
    const guestAnswers = guestAnswer.answers;

    let totalQuestions = 0;
    let correctCount = 0;

    for (const question in ownerAnswers) {
      totalQuestions++;
      const ownerAnswer = ownerAnswers[question]?.trim().toLowerCase();
      const guestAnswer = guestAnswers[question]?.trim().toLowerCase();
      if (guestAnswer && ownerAnswer && guestAnswer === ownerAnswer) {
        correctCount++;
      }
    }


    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // ✅ احفظ النتيجة في الداتا بيز
    await Answer.findByIdAndUpdate(guestAnswer._id, {
      resultPercentage: percentage,
      correctAnswersCount: correctCount,
      totalQuestions
    });

    const resultData = {
      guestName: guestAnswer.guestName,
      guestEmail: guestAnswer.guestEmail,
      ownerName: guestAnswer.ownerName,
      ownerEmail: guestAnswer.ownerEmail,
      percentage,
      correctCount,
      totalQuestions
    };

    res.json({ success: true, result: resultData });

  } catch (err) {
    console.error("Error comparing answers:", err);
    res.status(500).json({ error: "Server error while comparing answers" });
  }
};










module.exports = { ownerName,answerStorage , compareAnswersAndReturnResult };
