const run = async () => {
  const api = 'http://127.0.0.1:5000'
  try {
    const lr = await fetch(`${api}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: '123456' })
    })
    const loginRes = await lr.json()
    console.log('login ok', !!loginRes.token)
  } catch (e) {
    console.error('login fail', e.message)
  }
  try {
    const email = `user${Date.now()}@example.com`
    const rr = await fetch(`${api}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke User', email, password: '123456' })
    })
    const regRes = await rr.json()
    console.log('register ok', regRes.email === email)
  } catch (e) {
    console.error('register fail', e.message)
  }
}

run()
