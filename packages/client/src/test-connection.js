// Test script to verify API connection
console.log("Testing API Connection");

// Get the API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
console.log("Using API URL:", API_URL);

// Function to test the connection
async function testConnection() {
  try {
    console.log("Sending request to", `${API_URL}/api/health`);
    const response = await fetch(`${API_URL}/api/health`);

    if (response.ok) {
      const data = await response.json();
      console.log("Server is accessible! Response:", data);
      document.getElementById("result").textContent =
        "✅ Connection successful! Server is running.";
      document.getElementById("result").className = "success";
    } else {
      console.error("Server returned error:", response.status);
      document.getElementById("result").textContent =
        "❌ Server returned error: " + response.status;
      document.getElementById("result").className = "error";
    }
  } catch (error) {
    console.error("Connection failed:", error);
    document.getElementById("result").textContent =
      "❌ Connection failed: " + error.message;
    document.getElementById("result").className = "error";

    // Provide helpful diagnostics
    if (
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch")
    ) {
      document.getElementById("diagnostics").innerHTML = `
        <p>Possible issues:</p>
        <ul>
          <li>Server is not running - start with \`yarn workspace @fyp-saturn/server dev\`</li>
          <li>CORS is not configured correctly on the server</li>
          <li>API URL is incorrect - current value: "${API_URL}"</li>
          <li>Firewall blocking the connection</li>
        </ul>
      `;
    }
  }
}

// Execute the test when the button is clicked
document.getElementById("testButton").addEventListener("click", testConnection);

// Show the current API URL on the page
document.getElementById("apiUrl").textContent = API_URL;
