require('dotenv').config();
const db = require('./src/config/db');
const fs = require('fs');

async function test() {
  try {
    const [assn] = await db.query('DESCRIBE assignments');
    fs.writeFileSync('schema_output.json', JSON.stringify(assn, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
test();
