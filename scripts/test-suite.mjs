// Automated Integration & Verification Test Suite for Jeeva Portfolio
// Tests: Auth, Protected APIs, CRUD, Security, Validation, Contact Form, Persistence

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failedCount++;
    }
  }

  // -------------------------------------------------------------
  // TEST D: Unauthorized Access Denied to Protected Admin APIs
  // -------------------------------------------------------------
  console.log('--- TEST D: Security & Access Control ---');

  const unauthMessagesGet = await fetch(`${BASE_URL}/api/admin/messages`);
  assert(unauthMessagesGet.status === 401, 'Unauthenticated GET /api/admin/messages is blocked (401)');

  const unauthMessagesPost = await fetch(`${BASE_URL}/api/admin/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: 'fake-id' }),
  });
  assert(unauthMessagesPost.status === 401, 'Unauthenticated POST /api/admin/messages is blocked (401)');

  const unauthUpdatePost = await fetch(`${BASE_URL}/api/admin/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: {} }),
  });
  assert(unauthUpdatePost.status === 401, 'Unauthenticated POST /api/admin/update is blocked (401)');

  // -------------------------------------------------------------
  // TEST E: Non-Admin / Tampered Session Token Denied
  // -------------------------------------------------------------
  console.log('\n--- TEST E: Non-Admin / Invalid Session Handling ---');

  const invalidTokenUpdate = await fetch(`${BASE_URL}/api/admin/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'admin_token=non-admin-regular-user-session',
    },
    body: JSON.stringify({ profile: {} }),
  });
  assert(invalidTokenUpdate.status === 401, 'Non-admin / tampered session token is denied admin access (401)');

  // -------------------------------------------------------------
  // TEST F: Form Validation & Error Handling
  // -------------------------------------------------------------
  console.log('\n--- TEST F: Input Validation & Edge Cases ---');

  const invalidLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secretCode: 'wrong-passcode-999' }),
  });
  assert(invalidLogin.status === 401, 'Invalid secretCode is rejected (401)');

  const invalidContactMissing = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Tester' }), // missing email and message
  });
  assert(invalidContactMissing.status === 400, 'Incomplete contact form rejected (400)');

  const spamContact = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bot',
      email: 'bot@spam.com',
      message: 'Spam text here',
      honeypot: 'filled_by_bot',
    }),
  });
  assert(spamContact.status === 400, 'Honeypot spam bot rejected (400)');

  // -------------------------------------------------------------
  // Authentication: Passcode & Credentials
  // -------------------------------------------------------------
  console.log('\n--- Authentication & Session Management ---');

  const validLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secretCode: 'jeeva0225' }),
  });
  assert(validLoginRes.status === 200, 'Valid secretCode logs in successfully (200)');

  const setCookieHeader = validLoginRes.headers.get('set-cookie');
  assert(setCookieHeader && setCookieHeader.includes('admin_token='), 'admin_token cookie is issued by server');

  // Extract auth cookie
  const cookieMatch = setCookieHeader?.match(/admin_token=([^;]+)/);
  const authCookie = cookieMatch ? `admin_token=${cookieMatch[1]}` : '';

  // Also test username/password authentication
  const credsLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  assert(credsLoginRes.status === 200, 'Valid username/password logs in successfully (200)');

  // -------------------------------------------------------------
  // TEST A: Admin Creates Project & Saves Data
  // -------------------------------------------------------------
  console.log('\n--- TEST A: Project Creation & Persistence ---');

  // 1. Fetch current portfolio data
  const currentPortfolioRes = await fetch(`${BASE_URL}/api/portfolio`);
  const initialPortfolioData = await currentPortfolioRes.json();
  assert(initialPortfolioData && initialPortfolioData.projects, 'Public GET /api/portfolio returns portfolio structure');

  const initialProjectCount = initialPortfolioData.projects.length;
  const testProject = {
    id: `proj-test-${Date.now()}`,
    title: 'Automated Test AI Neural Project',
    category: 'AI / Vision',
    techStack: ['TypeScript', 'Jest', 'OpenCV'],
    description: 'A test project created by automated verification suite.',
    longDescription: 'Comprehensive test project validating end-to-end admin workflow.',
    githubUrl: 'https://github.com/jeevasenthilkumar0225-max/test',
    liveUrl: 'https://example.com/demo',
    featured: true,
  };

  // 2. Add project to data payload
  const updatedWithNewProject = {
    ...initialPortfolioData,
    projects: [testProject, ...initialPortfolioData.projects],
  };

  // 3. Save as authenticated admin
  const saveCreateRes = await fetch(`${BASE_URL}/api/admin/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify(updatedWithNewProject),
  });
  assert(saveCreateRes.status === 200, 'Authenticated admin saves new project (200)');

  // 4. Read back public portfolio to verify persistence
  const verifyCreateRes = await fetch(`${BASE_URL}/api/portfolio`);
  const verifyCreateData = await verifyCreateRes.json();
  const createdFound = verifyCreateData.projects.find((p) => p.id === testProject.id);
  assert(createdFound && createdFound.title === testProject.title, 'Newly created project is persisted and visible on public portfolio');

  // -------------------------------------------------------------
  // TEST B: Admin Edits Existing Project & Saves Changes
  // -------------------------------------------------------------
  console.log('\n--- TEST B: Project Update & Live Reflection ---');

  const editedTitle = 'Automated Test AI Neural Project - EDITED';
  const updatedWithEdit = {
    ...verifyCreateData,
    projects: verifyCreateData.projects.map((p) =>
      p.id === testProject.id ? { ...p, title: editedTitle, category: 'Full Stack' } : p
    ),
  };

  const saveEditRes = await fetch(`${BASE_URL}/api/admin/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify(updatedWithEdit),
  });
  assert(saveEditRes.status === 200, 'Authenticated admin saves edited project (200)');

  const verifyEditRes = await fetch(`${BASE_URL}/api/portfolio`);
  const verifyEditData = await verifyEditRes.json();
  const editedFound = verifyEditData.projects.find((p) => p.id === testProject.id);
  assert(editedFound && editedFound.title === editedTitle, 'Updated project title is reflected on public portfolio');

  // -------------------------------------------------------------
  // TEST C: Admin Deletes Test Project & Confirms Absence
  // -------------------------------------------------------------
  console.log('\n--- TEST C: Project Deletion & Clean-up ---');

  const updatedWithDelete = {
    ...verifyEditData,
    projects: verifyEditData.projects.filter((p) => p.id !== testProject.id),
  };

  const saveDeleteRes = await fetch(`${BASE_URL}/api/admin/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    body: JSON.stringify(updatedWithDelete),
  });
  assert(saveDeleteRes.status === 200, 'Authenticated admin saves deletion (200)');

  const verifyDeleteRes = await fetch(`${BASE_URL}/api/portfolio`);
  const verifyDeleteData = await verifyDeleteRes.json();
  const deletedFound = verifyDeleteData.projects.find((p) => p.id === testProject.id);
  assert(!deletedFound && verifyDeleteData.projects.length === initialProjectCount, 'Deleted project is permanently removed');

  // -------------------------------------------------------------
  // Contact Message Delivery & Admin Inbox Workflow
  // -------------------------------------------------------------
  console.log('\n--- Contact Form & Admin Inbox ---');

  const testMsgEmail = `test-${Date.now()}@domain.com`;
  const contactSendRes = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Automated QA Agent',
      email: testMsgEmail,
      subject: 'Test Inbound Inquiry',
      message: 'Hello Jeeva, this is an automated test message for verifying contact flow.',
    }),
  });
  assert(contactSendRes.status === 200, 'Visitor can submit contact message (200)');

  // Admin checks inbox
  const adminInboxRes = await fetch(`${BASE_URL}/api/admin/messages`, {
    headers: { Cookie: authCookie },
  });
  assert(adminInboxRes.status === 200, 'Authenticated admin can fetch inbox messages (200)');
  const inboxData = await adminInboxRes.json();
  const targetMsg = (inboxData.messages || []).find((m) => m.email === testMsgEmail);
  assert(Boolean(targetMsg), 'Submitted contact message appears in Admin Inbox');

  if (targetMsg) {
    // Admin toggles read state
    const toggleReadRes = await fetch(`${BASE_URL}/api/admin/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({ action: 'toggleRead', id: targetMsg.id }),
    });
    assert(toggleReadRes.status === 200, 'Admin can toggle read state of message');

    // Admin deletes the test message
    const deleteMsgRes = await fetch(`${BASE_URL}/api/admin/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookie,
      },
      body: JSON.stringify({ action: 'delete', id: targetMsg.id }),
    });
    assert(deleteMsgRes.status === 200, 'Admin can delete message from inbox');
  }

  // -------------------------------------------------------------
  // Logout & Session Invalidation
  // -------------------------------------------------------------
  console.log('\n--- Logout & Session Expiration ---');

  const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, {
    method: 'POST',
    headers: { Cookie: authCookie },
  });
  assert(logoutRes.status === 200, 'Admin logout succeeds');

  // Verify cookie deletion
  const logoutSetCookie = logoutRes.headers.get('set-cookie');
  assert(
    logoutSetCookie && (logoutSetCookie.includes('admin_token=;') || logoutSetCookie.includes('Max-Age=0')),
    'admin_token cookie is deleted on logout'
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
