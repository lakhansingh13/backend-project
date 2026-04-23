const axios = require('axios');

const URL = 'http://localhost:3000/login'; // your login route

async function testBot() {
  console.log("🚀 Starting bot attack...\n");

  for (let i = 1; i <= 10; i++) {
    try {
      const res = await axios.post(URL, {
        email: "test@test.com",
        password: "wrongpassword"
      });

      console.log(`Attempt ${i}: SUCCESS`, res.data);

    } catch (err) {
      if (err.response) {
        console.log(`Attempt ${i}: ERROR`, err.response.status, err.response.data);
      } else {
        console.log(`Attempt ${i}: Request failed`);
      }
    }
  }

  console.log("\n✅ Bot test completed");
}

testBot();