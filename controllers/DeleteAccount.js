const User = require('../models/User');
const Data = require("../models/Data"); 



// دالة للطلب   

const requestDeletion = async function(req, res){
  try {
    const userId = req.user._id;

    const deletionDelayDays = 3;
    const deletionDate = new Date(Date.now() + deletionDelayDays * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(userId, {
      deletionRequested: true,
      deletionDate: deletionDate
    });

    // انهي السيشن علشان يطلع برة
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.clearCookie('connect.sid'); // أو حسب اسم الكوكي عندك

      return res.json({
        message: `تم طلب حذف الحساب. سيتم حذفه نهائيًا بعد ثلاثة أيام . لقد تم تسجيل خروجك.`
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء طلب حذف الحساب.' });
  }
};

// دالة للحذف نفسه
async function deleteExpiredAccounts() {
  try {
    const now = new Date();

    const usersToDelete = await User.find({
      deletionRequested: true,
      deletionDate: { $lte: now }
    });

    console.log(`Found ${usersToDelete.length} accounts to delete.`);

    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user._id}`);

      // حذف كل الداتا المرتبطة
  await Promise.all([
  Data.deleteMany({ user: user._id })
]);

        // ضيف هنا موديلات تانية لو عند);

      // حذف اليوزر نفسه
      await User.findByIdAndDelete(user._id);
    }

    console.log('All expired accounts deleted successfully.');
  } catch (error) {
    console.error('Error deleting expired accounts:', error);
  }
}




module.exports = 
{requestDeletion,
deleteExpiredAccounts
};