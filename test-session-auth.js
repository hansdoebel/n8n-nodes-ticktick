#!/usr/bin/env node
/**
 * Test script to authenticate with TickTick V2 API using session-based auth
 * This bypasses n8n to test if credentials work directly
 *
 * Usage:
 *   node test-session-auth.js <email> <password>
 *
 * Example:
 *   node test-session-auth.js user@example.com mypassword
 */

const https = require('https');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.error('❌ Please provide email and password as arguments');
    console.error('Usage: node test-session-auth.js <email> <password>');
    process.exit(1);
}

console.log('🔍 Testing TickTick V2 Session Authentication...\n');
console.log(`Username: ${username}`);
console.log(`Password: ${'*'.repeat(password.length)}\n`);

/**
 * Make an HTTPS request
 */
function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                } catch {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }

        req.end();
    });
}

async function testSessionAuth() {
    console.log('1️⃣  Attempting to sign in...');

    const deviceId = 'n8n' + Array(21).fill(0).map(() =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const signInOptions = {
        hostname: 'ticktick.com',
        path: '/api/v2/user/signon?wc=true&remember=true',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (rv:145.0) Firefox/145.0',
            'X-Device': JSON.stringify({
                platform: 'web',
                version: 6430,
                id: deviceId
            }),
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await makeRequest(signInOptions, {
            username,
            password
        });

        console.log(`   Status: ${response.status}`);

        if (response.status === 500) {
            const errorCode = response.body?.errorCode;
            const errorMessage = response.body?.errorMessage;

            console.log(`   ❌ Server Error:`);
            console.log(`      Error Code: ${errorCode}`);
            console.log(`      Error Message: ${errorMessage}`);

            if (errorCode === 'incorrect_password_too_many_times') {
                console.log('\n⚠️  Too many failed attempts.');
                console.log('   Wait 15-30 minutes and try again.');
            } else if (errorCode === 'incorrect_password') {
                console.log('\n⚠️  Incorrect username or password.');
                console.log('   Please verify your credentials.');
            }
            return null;
        }

        if (response.status !== 200) {
            console.log(`   ❌ Unexpected status: ${JSON.stringify(response.body)}`);
            return null;
        }

        // Check for 2FA
        if (response.body.authId && !response.body.token) {
            console.log('   ⚠️  Two-factor authentication is required');
            console.log('   Session API does not support 2FA');
            console.log('   Please disable 2FA to use session-based auth');
            return null;
        }

        // Extract token
        let token = response.body.token;
        if (!token && response.headers['set-cookie']) {
            const cookies = Array.isArray(response.headers['set-cookie'])
                ? response.headers['set-cookie']
                : [response.headers['set-cookie']];

            for (const cookie of cookies) {
                const match = cookie.match(/^t=([^;]+)/);
                if (match) {
                    token = match[1];
                    break;
                }
            }
        }

        if (!token) {
            console.log('   ❌ No token received in response');
            return null;
        }

        console.log('   ✅ Authentication successful!');
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   Inbox ID: ${response.body.inboxId || 'N/A'}`);
        console.log(`   User ID: ${response.body.userId || 'N/A'}`);

        return { token, deviceId, inboxId: response.body.inboxId };

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return null;
    }
}

async function testV2APICall(token, deviceId) {
    console.log('\n2️⃣  Testing V2 API call with session token...');

    const options = {
        hostname: 'ticktick.com',
        path: '/api/v2/user/preferences',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (rv:145.0) Firefox/145.0',
            'X-Device': JSON.stringify({
                platform: 'web',
                version: 6430,
                id: deviceId
            }),
            'Cookie': `t=${token}`,
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await makeRequest(options);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
            console.log('   ✅ V2 API call successful!');
            console.log(`   Preferences: ${JSON.stringify(response.body).substring(0, 100)}...`);
            return true;
        } else {
            console.log(`   ❌ V2 API call failed: ${JSON.stringify(response.body)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function testV2Habits(token, deviceId) {
    console.log('\n3️⃣  Testing V2 Habits endpoint...');

    const options = {
        hostname: 'ticktick.com',
        path: '/api/v2/habits',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (rv:145.0) Firefox/145.0',
            'X-Device': JSON.stringify({
                platform: 'web',
                version: 6430,
                id: deviceId
            }),
            'Cookie': `t=${token}`,
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await makeRequest(options);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
            console.log('   ✅ Habits endpoint works!');
            const habits = Array.isArray(response.body) ? response.body : [];
            console.log(`   Habits found: ${habits.length}`);
            return true;
        } else {
            console.log(`   ❌ Habits endpoint failed: ${JSON.stringify(response.body)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    const sessionData = await testSessionAuth();

    if (!sessionData) {
        console.log('\n' + '='.repeat(60));
        console.log('❌ SESSION AUTHENTICATION FAILED');
        console.log('='.repeat(60));
        console.log('Please check your credentials and try again.');
        return;
    }

    const apiWorks = await testV2APICall(sessionData.token, sessionData.deviceId);
    const habitsWork = await testV2Habits(sessionData.token, sessionData.deviceId);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS:');
    console.log('='.repeat(60));
    console.log(`Session Authentication:         ✅ SUCCESS`);
    console.log(`V2 API Call:                    ${apiWorks ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`V2 Habits Endpoint:             ${habitsWork ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('='.repeat(60));

    if (apiWorks && habitsWork) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('Your credentials work with TickTick V2 API!');
        console.log('\n💡 The issue is with n8n credential testing, not your credentials.');
        console.log('   You can use these credentials in n8n workflows even if the test fails.');
    }
}

runTests().catch(console.error);
