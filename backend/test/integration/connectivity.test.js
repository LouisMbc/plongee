const fetch = require('node-fetch');
const { Client } = require('pg');

// Quick integration check: frontend -> backend -> DB
// Assumes frontend on localhost:3000 and backend on localhost:3001 and Postgres on localhost:5433

async function checkFrontend() {
  const res = await fetch('http://localhost:3000');
  return res.status === 200;
}

async function checkBackend() {
  const res = await fetch('http://localhost:3001/api/fish?q=Gadus morhua');
  return res.status === 200;
}

async function checkDb() {
  const client = new Client({
    connectionString: 'postgresql://plongee_user:plongee_password@localhost:5433/plongee_db'
  });
  await client.connect();
  const r = await client.query("SELECT 1 as ok");
  await client.end();
  return r.rows[0].ok === 1;
}

(async () => {
  try {
    console.log('Checking frontend...');
    const f = await checkFrontend();
    console.log('Frontend OK:', f);

    console.log('Checking backend...');
    const b = await checkBackend();
    console.log('Backend OK:', b);

    console.log('Checking database...');
    const d = await checkDb();
    console.log('DB OK:', d);

    if (f && b && d) {
      console.log('All systems connected.');
      process.exit(0);
    }
    console.error('Connectivity check failed.');
    process.exit(2);
  } catch (err) {
    console.error('Error during connectivity check:', err.message);
    process.exit(3);
  }
})();
