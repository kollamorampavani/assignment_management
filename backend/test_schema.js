require('dotenv').config();
const db = require('./src/config/db');

async function test() {
  try {
    const [notif] = await db.query('DESCRIBE notifications');
    console.log("NOTIFICATIONS SCHEMA:", notif);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
test();
