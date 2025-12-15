// Simple integration test for backend /api/fish endpoint

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';

async function callFish(q) {
  const res = await fetch(`${BACKEND}/api/fish?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
  const text = await res.text()
  const json = JSON.parse(text)
  if (!Array.isArray(json)) throw new Error('expected array')
  return json
}

(async function run(){
  try {
    console.log('Calling backend /api/fish')
    const r = await callFish('Gadus morhua')
    console.log('Received', r.length, 'items')
    console.log('Items:', JSON.stringify(r, null, 2))  // Affiche les détails
    process.exit(0)
  } catch (e) {
    console.error('backend test failed:', e.message)
    process.exit(2)
  }
})()
