import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    app.listen(PORT, () => {
      console.log('Server running on port:', PORT);
    });
  } catch (err) {
    console.error('DB Connection failed:', err);
    process.exit(1);
  }
}

start();