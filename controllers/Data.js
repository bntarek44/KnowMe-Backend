const Data = require("../models/Data");
const User = require("../models/User");
// لاستقبال اجابات اليوزر وحفظها
const dataStorage = async function (req, res) {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: "Answers are required" });
    }

    console.log("المستخدم:", req.user);

    let existing = await Data.findOne({ user: req.user._id });

    if (existing) {
      existing.answers = answers;
      await existing.save();
    } else {
      const newAnswer = new Data({ answers, user: req.user._id });
      await newAnswer.save();
    }

    await User.updateOne({ _id: req.user._id }, { ownerHasAnswered: true });

    res.status(201).json({ message: "Answers saved successfully" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};



// لارسال الاجابات المحفوظة ف الداتا بيز عشان تملي بيها الفورم حال التعديل
const getData = async function (req, res) {
  try {
    // تأكد إن المستخدم مسجل دخول
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // دور على الإجابة في DB
    const existing = await Data.findOne({ user: req.user._id });
    console.log('req.user._id:', req.user._id);


    if (!existing) {
      return res.status(404).json({ message: "لا يوجد بيانات محفوظة لهذا المستخدم" });
    }

    res.status(200).json({ data: existing });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};


module.exports = { dataStorage, getData};
