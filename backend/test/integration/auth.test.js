const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';

async function testRegister() {
  const randomPseudo = `user${Date.now()}`;
  
  const res = await fetch(`${BACKEND}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pseudo: randomPseudo,
      password: 'password123',
      nom: 'Dupont',
      prenom: 'Jean'
    })
  });

  const data = await res.json();
  
  if (res.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(data)}`);
  }
  
  if (!data.token || !data.user) {
    throw new Error('Missing token or user in response');
  }
  
  console.log('   ✓ User created:', data.user.pseudo);
  return { token: data.token, pseudo: randomPseudo };
}

async function testLogin(pseudo) {
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pseudo,
      password: 'password123'
    })
  });

  const data = await res.json();
  
  if (res.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
  }
  
  if (!data.token) {
    throw new Error('Missing token in response');
  }
  
  console.log('   ✓ Login successful for:', pseudo);
  return data.token;
}

async function testGetProfile(token) {
  const res = await fetch(`${BACKEND}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await res.json();
  
  if (res.status !== 200) {
    throw new Error(`Get profile failed: ${JSON.stringify(data)}`);
  }
  
  if (!data.user) {
    throw new Error('Missing user in response');
  }
  
  console.log('   ✓ Profile retrieved:', data.user.pseudo);
  return data.user;
}

(async function run() {
  try {
    console.log('\n🧪 Testing authentication flow...\n');
    
    console.log('1️⃣  Testing registration...');
    const { token, pseudo } = await testRegister();
    
    console.log('\n2️⃣  Testing login...');
    const loginToken = await testLogin(pseudo);
    
    console.log('\n3️⃣  Testing get profile...');
    await testGetProfile(loginToken);
    
    console.log('\n✅ All authentication tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message, '\n');
    process.exit(1);
  }
})();
