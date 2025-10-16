// Test minimal pour vérifier que le service rfishbase répond

const RFISHBASE = process.env.RFISHBASE_URL || 'http://localhost:8000';

async function checkPing() {
  const res = await fetch(`${RFISHBASE}/ping`, { cache: 'no-store' })
  const text = await res.text()
  const json = JSON.parse(text)
  const status = json.status
  if (status === 'ok' || (Array.isArray(status) && status[0] === 'ok')) return true
  throw new Error('invalid ping response: ' + JSON.stringify(json))
}

(async function run() {
  try {
    console.log('Checking rfishbase ping at', RFISHBASE)
    await checkPing()
    console.log('rfishbase is reachable ✅')
    process.exit(0)
  } catch (e) {
    console.error('rfishbase test failed:', e.message)
    process.exit(2)
  }
})()
