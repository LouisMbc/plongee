// Test minimal pour vérifier que le service rfishbase répond
const http = require('http');

const url = process.env.RFISHBASE_URL || 'http://localhost:8000';

function checkPing() {
  return new Promise((resolve, reject) => {
    http.get(`${url}/ping`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const status = json.status;
          if (status === 'ok' || (Array.isArray(status) && status[0] === 'ok')) resolve(true);
          else reject(new Error('invalid ping response: ' + JSON.stringify(json)));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => reject(err));
  });
}

(async function run() {
  try {
    console.log('Checking rfishbase ping at', url);
    await checkPing();
    console.log('rfishbase is reachable ✅');
    process.exit(0);
  } catch (e) {
    console.error('rfishbase test failed:', e.message);
    process.exit(2);
  }
})();
