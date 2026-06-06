const http = require("http");

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to perform HTTP requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsedUrl = new URL(url);
    const options = {
      method: method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING PHASE 2 CORE BUSINESS LOGIC TESTS ===");

  let token;
  const adminEmail = "admin@placement.com";
  const adminPassword = "password123";

  // 1. Register or Login User
  console.log("\n1. Registering/Logging in test user...");
  try {
    const regRes = await request("POST", "/api/auth/register", {
      name: "Placement Officer",
      email: adminEmail,
      password: adminPassword,
    });
    
    if (regRes.status === 201) {
      console.log("✔ Registration Successful!");
      token = regRes.body.token;
    } else if (regRes.status === 400 && regRes.body?.message === "User already exists") {
      console.log("User already exists, attempting login...");
      const loginRes = await request("POST", "/api/auth/login", {
        email: adminEmail,
        password: adminPassword,
      });
      if (loginRes.status === 200) {
        console.log("✔ Login Successful!");
        token = loginRes.body.token;
      } else {
        console.log(`❌ Login failed with status: ${loginRes.status}`);
        process.exit(1);
      }
    } else {
      console.log(`❌ Auth failed with status: ${regRes.status}`);
      console.log(regRes.body);
      process.exit(1);
    }
  } catch (err) {
    console.error("Connection failed. Make sure server is running on port 5000.");
    console.error(err);
    process.exit(1);
  }

  // 2. Add Student
  console.log("\n2. Adding a new student record...");
  const rollNumber = `ROLL_${Date.now()}`;
  let studentId;
  const studentRes = await request("POST", "/api/students", {
    rollNumber,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    branch: "Computer Science",
    cgpa: 9.5,
    resumeUrl: "https://example.com/resumes/jane_doe.pdf",
  }, token);

  if (studentRes.status === 201) {
    console.log("✔ Student created successfully!");
    studentId = studentRes.body._id;
    console.log(`Student ID: ${studentId}`);
  } else {
    console.log(`❌ Failed to create student: ${studentRes.status}`);
    console.log(studentRes.body);
    process.exit(1);
  }

  // 3. Search Student
  console.log("\n3. Testing student search (?search=Jane)...");
  const searchRes = await request("GET", "/api/students?search=Jane", null, token);
  if (searchRes.status === 200 && searchRes.body.length > 0) {
    console.log(`✔ Found ${searchRes.body.length} student(s) matching search.`);
  } else {
    console.log(`❌ Search test failed: status ${searchRes.status}`);
    console.log(searchRes.body);
    process.exit(1);
  }

  // 4. Create Company
  console.log("\n4. Creating a company recruitment workflow...");
  const companyName = `Google_${Date.now()}`;
  let companyId;
  const companyRes = await request("POST", "/api/companies", {
    name: companyName,
    rounds: ["Aptitude", "Technical Interview", "HR Round"],
  }, token);

  if (companyRes.status === 201) {
    console.log("✔ Company created successfully!");
    companyId = companyRes.body._id;
    console.log(`Company ID: ${companyId}`);
  } else {
    console.log(`❌ Failed to create company: ${companyRes.status}`);
    console.log(companyRes.body);
    process.exit(1);
  }

  // 5. Register Application
  console.log("\n5. Registering student to company drive...");
  let applicationId;
  const appRes = await request("POST", "/api/applications/register", {
    student: studentId,
    company: companyId,
  }, token);

  if (appRes.status === 201) {
    console.log("✔ Application registered successfully!");
    applicationId = appRes.body._id;
    console.log(`Application ID: ${applicationId}`);
    console.log(`Current Status: ${appRes.body.status} (Expected: Pending)`);
    console.log(`Current Round Index: ${appRes.body.currentRoundIndex} (Expected: 0)`);
    console.log(`History length: ${appRes.body.history.length} (Expected: 1)`);
  } else {
    console.log(`❌ Failed to register application: ${appRes.status}`);
    console.log(appRes.body);
    process.exit(1);
  }

  // 6. Update Round 1: Passed
  console.log("\n6. Advancing Application: Round 1 (Aptitude) Passed...");
  const round1Res = await request("POST", "/api/applications/update-round", {
    applicationId,
    attendanceStatus: "Present",
    roundStatus: "Passed",
    marks: 88,
    remarks: "Good reasoning skills",
  }, token);

  if (round1Res.status === 200) {
    console.log("✔ Round 1 updated!");
    console.log(`Current Status: ${round1Res.body.status} (Expected: Pending)`);
    console.log(`Current Round Index: ${round1Res.body.currentRoundIndex} (Expected: 1)`);
  } else {
    console.log(`❌ Round 1 update failed: ${round1Res.status}`);
    console.log(round1Res.body);
    process.exit(1);
  }

  // 7. Update Round 2: Passed
  console.log("\n7. Advancing Application: Round 2 (Technical Interview) Passed...");
  const round2Res = await request("POST", "/api/applications/update-round", {
    applicationId,
    attendanceStatus: "Present",
    roundStatus: "Passed",
    marks: 92,
    remarks: "Excellent coder",
  }, token);

  if (round2Res.status === 200) {
    console.log("✔ Round 2 updated!");
    console.log(`Current Status: ${round2Res.body.status} (Expected: Pending)`);
    console.log(`Current Round Index: ${round2Res.body.currentRoundIndex} (Expected: 2)`);
  } else {
    console.log(`❌ Round 2 update failed: ${round2Res.status}`);
    console.log(round2Res.body);
    process.exit(1);
  }

  // 8. Update Round 3: Passed (Final Round -> Offered)
  console.log("\n8. Finalizing Application: Round 3 (HR Round) Passed...");
  const round3Res = await request("POST", "/api/applications/update-round", {
    applicationId,
    attendanceStatus: "Present",
    roundStatus: "Passed",
    marks: 90,
    remarks: "Fits cultural values",
  }, token);

  if (round3Res.status === 200) {
    console.log("✔ Round 3 updated!");
    console.log(`Current Status: ${round3Res.body.status} (Expected: Offered)`);
    console.log(`Current Round Index: ${round3Res.body.currentRoundIndex} (Expected: 2)`);
  } else {
    console.log(`❌ Round 3 update failed: ${round3Res.status}`);
    console.log(round3Res.body);
    process.exit(1);
  }

  // 9. Fetch Dashboard Metrics
  console.log("\n9. Fetching dashboard stats...");
  const dashRes = await request("GET", "/api/applications/dashboard", null, token);
  if (dashRes.status === 200) {
    console.log("✔ Dashboard metrics retrieved!");
    console.log(`Total Placed: ${dashRes.body.totalPlaced}`);
    console.log(`Total Pending: ${dashRes.body.totalPending}`);
    console.log(`Total Rejected: ${dashRes.body.totalRejected}`);
  } else {
    console.log(`❌ Dashboard stats failed: ${dashRes.status}`);
    console.log(dashRes.body);
    process.exit(1);
  }

  // 10. Update Student Profile
  console.log("\n10. Updating student profile...");
  const updateRes = await request("PUT", `/api/students/${studentId}`, {
    cgpa: 9.8,
  }, token);

  if (updateRes.status === 200) {
    console.log(`✔ Student updated successfully! New CGPA: ${updateRes.body.cgpa} (Expected: 9.8)`);
  } else {
    console.log(`❌ Student update failed: ${updateRes.status}`);
    console.log(updateRes.body);
    process.exit(1);
  }

  // 11. Delete Student Record
  console.log("\n11. Deleting student record...");
  const deleteRes = await request("DELETE", `/api/students/${studentId}`, null, token);
  if (deleteRes.status === 200) {
    console.log("✔ Student record deleted successfully!");
  } else {
    console.log(`❌ Student deletion failed: ${deleteRes.status}`);
    console.log(deleteRes.body);
    process.exit(1);
  }

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
  console.log(`\nAdministrative login credentials for testing:`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  process.exit(0);
}

runTests();
