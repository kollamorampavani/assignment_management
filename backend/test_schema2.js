require('dotenv').config();
const db = require('./src/config/db');

async function test() {
  try {
    const [enr] = await db.query('DESCRIBE enrollments');
    console.dir(enr, { depth: null });
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
test();
