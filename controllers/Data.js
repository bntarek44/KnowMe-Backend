const Data = require("../models/Data"); // استيراد الموديل الخاص بالبيانات
const User = require("../models/User");

// فانكشن استقبال البيانات وتخزينها 
const dataStorage = async function(req, res)  {
  try {
    const { season } = req.body;

    if (!season) {
      return res.status(400).json({ error: "Season is required" });
    }
    console.log("المستخدم:", req.user);

    // منع تكرار الإجابة
const existing = await Data.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "لقد أجبت بالفعل!" });
    }


    const newAnswer = new Data({ season , user: req.user._id });

    await newAnswer.save();
// بعد حفظ إجابات المستخدم
    await User.updateOne({ _id: req.user._id }, { hasAnsweredQuiz: true });
    res.status(201).json({ message: "Answer saved successfully" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });

  }
};

module.exports = {dataStorage};