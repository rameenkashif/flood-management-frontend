const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  try {
    // 1. Register User
    console.log("Registering user...");
    const uniqueEmail = "zainab" + Date.now() + "@example.com";
    const registerRes = await axios.post(`${BASE_URL}/users/register`, {
      name: "Zainab",
      email: uniqueEmail,
      phone: "03001234567",
      password: "123456"
    });
    const user = registerRes.data;
    console.log("User Registered:", user);

    // 2. Login User
    console.log("\nLogging in user...");
    const loginRes = await axios.post(`${BASE_URL}/users/login`, {
      email: "zainab@example.com",
      password: "123456"
    });
    const loggedInUser = loginRes.data;
    console.log("User Logged In:", loggedInUser);

    const userId = loggedInUser._id;

    // 3. Add Asset
    console.log("\nAdding asset...");
    const assetRes = await axios.post(`${BASE_URL}/assets`, {
      userId: userId,
      type: "House",
      description: "2-story house near river",
      value: 15000000
    });
    const asset = assetRes.data;
    console.log("Asset Added:", asset);

    const assetId = asset._id;

    // 4. Sign Agreement
    console.log("\nSigning agreement...");
    const agreementRes = await axios.post(`${BASE_URL}/agreements`, {
      assetId: assetId,
      agreementText: "I declare this asset is registered for protection in case of flood."
    });
    const agreement = agreementRes.data;
    console.log("Agreement Signed:", agreement);

    // 5. Get User Assets
    console.log("\nFetching user assets...");
    const assetsList = await axios.get(`${BASE_URL}/assets/${userId}`);
    console.log("User Assets:", assetsList.data);

    // 6. Get User Agreements
    console.log("\nFetching user agreements...");
    const agreementsList = await axios.get(`${BASE_URL}/agreements/${userId}`);
    console.log("User Agreements:", agreementsList.data);

    console.log("\n✅ Backend test completed successfully!");

  } catch (error) {
     if (error.response) {
    // Server responded with an error status
    console.error("Server Error:", error.response.status);
    console.error(error.response.data);
  } else if (error.request) {
    // Request was sent but no response received
    console.error("No response received:", error.request);
  } else {
    // Other errors
    console.error("Error:", error.message);
  }
  }
}

testBackend();
