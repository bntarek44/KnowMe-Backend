const Answer = require('../models/answer');  // استورد الموديل اللي فوق
const User = require('../models/User');      // الموديل بتاع اليوزر


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

const answerStorage = async function(req, res){
  try {
    const { token, answers } = req.body;

    if (!token || !answers) {
      return res.status(400).json({ error: 'Missing token or answers' });
    }

    // تأكد إن التوكن ده يخص يوزر موجود
    const owner = await User.findOne({ linkToken: token });
    if (!owner) {
      return res.status(404).json({ error: 'Invalid token / User not found' });
    }

    // احفظ الإجابة
    const newAnswer = new Answer({
      linkToken: token,
      answers,
      ownerEmail: owner.email,  // ايميل صاحب الكويز
      ownerName: owner.name       // اسم صاحب الكويز
    });

    await newAnswer.save();

    res.json({ success: true, message: 'Answer saved successfully' });
  } catch (error) {
    console.error('Error saving quiz answer:', error);
    res.status(500).json({ error: 'Server error while saving answer' });
  }
};














module.exports = { ownerName,answerStorage };
