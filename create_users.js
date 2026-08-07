const users = [
  {username: 'alice', email: 'alice@example.com', password: 'pass123'},
  {username: 'bob', email: 'bob@example.com', password: 'pass123'},
  {username: 'charlie', email: 'charlie@example.com', password: 'pass123'}
];

async function signup(user) {
  try {
    const res = await fetch('https://buildbuddy-backend-rvjq.onrender.com/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(user)
    });
    const text = await res.text();
    console.log(`${user.email}: ${res.status} - ${text}`);
  } catch (err) {
    console.error(`${user.email}: ERROR - ${err.message}`);
  }
}

async function run() {
  for (const user of users) {
    await signup(user);
  }
}

run();
