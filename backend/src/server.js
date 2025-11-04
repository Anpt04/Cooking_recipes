const app = require('./app');
const { sequelize, User } = require("./models"); // Sequelize models
const bcrypt = require("bcrypt");

const PORT = process.env.PORT;

async function initAdmin() {
  try {
    // Tìm user có role = admin
    const admin = await User.findOne({ where: { role: "admin" } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        username: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password_hash: hashedPassword,
        role: "admin"
      });

      console.log("✅ Admin account has been created!");
    } else {
      console.log("ℹ️ Admin account already exists");
    }
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  }
}


(async () => {
  try {
    initAdmin();
    await sequelize.authenticate();
    console.log(`✅ DB connected`);
    app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();