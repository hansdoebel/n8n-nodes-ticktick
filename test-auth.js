#!/usr/bin/env node
/**
 * Test script to check if V1 authentication (Token/OAuth2) works with V2 API endpoints
 *
 * Usage:
 *   node test-auth.js <token>
 *
 * Example:
 *   node test-auth.js your-ticktick-token-here
 */

const https = require('https');

const token = process.argv[2];

if (!token) {
    console.error('❌ Please provide a TickTick token as argument');
    console.error('Usage: node test-auth.js <token>');
    console.error('\nYou can get a token from:');
    console.error('  1. TickTick Developer Portal (https://developer.ticktick.com)');
    console.error('  2. Or use an existing n8n TickTick Token credential');
    process.exit(1);
}

console.log('🔍 Testing TickTick authentication methods...\n');

/**
 * Make an HTTP request
 */
function makeRequest(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, headers: res.headers, body: parsed });
                } catch {
                    resolve({ status: res.statusCode, headers: res.headers, body: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function testV1Endpoints() {
    console.log('📋 Testing V1 API with Token (Official API)...');

    const v1Options = {
        hostname: 'api.ticktick.com',
        path: '/open/v1/project',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await makeRequest(v1Options);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
            console.log('   ✅ V1 API works with token!');
            console.log(`   Projects found: ${response.body.length || 0}`);
            return true;
        } else {
            console.log(`   ❌ V1 API failed: ${JSON.stringify(response.body)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ V1 API error: ${error.message}`);
        return false;
    }
}

async function testV2WithToken() {
    console.log('\n📋 Testing V2 API with Token (Bearer Auth)...');

    const v2Options = {
        hostname: 'ticktick.com',
        path: '/api/v2/user/preferences',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (rv:145.0) Firefox/145.0',
        }
    };

    try {
        const response = await makeRequest(v2Options);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
            console.log('   ✅ V2 API works with Bearer token!');
            console.log(`   Response: ${JSON.stringify(response.body).substring(0, 100)}...`);
            return true;
        } else {
            console.log(`   ❌ V2 API with Bearer failed: ${JSON.stringify(response.body)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ V2 API error: ${error.message}`);
        return false;
    }
}

async function testV2WithTokenHeader() {
    console.log('\n📋 Testing V2 API with Token (X-Token header)...');

    const v2Options = {
        hostname: 'ticktick.com',
        path: '/api/v2/user/preferences',
        method: 'GET',
        headers: {
            'X-Token': token,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (rv:145.0) Firefox/145.0',
        }
    };

    try {
        const response = await makeRequest(v2Options);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
            console.log('   ✅ V2 API works with X-Token header!');
            console.log(`   Response: ${JSON.stringify(response.body).substring(0, 100)}...`);
            return true;
        } else {
            console.log(`   ❌ V2 API with X-Token failed: ${JSON.stringify(response.body)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ V2 API error: ${error.message}`);
        return false;
    }
}

async function testV2Habits() {
    console.log('\n📋 Testing V2 Habits endpoint with Token...');

    const v2Options = {
        hostname: 'ticktick.com',
        path: '/api/v2/habits',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (rv:145.0) Firefox/145.0',
        }
    };

    try {
        const response = await makeRequest(v2Options);
        console.log(`   Status: ${response.status}`);

        if (response.status === 200) {
            console.log('   ✅ V2 Habits endpoint works with Bearer token!');
            console.log(`   Habits found: ${response.body.length || 0}`);
            return true;
        } else {
            console.log(`   ❌ V2 Habits failed: ${JSON.stringify(response.body)}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ V2 Habits error: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    const v1Works = await testV1Endpoints();
    const v2TokenWorks = await testV2WithToken();
    const v2XTokenWorks = await testV2WithTokenHeader();
    const v2HabitsWorks = await testV2Habits();

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS:');
    console.log('='.repeat(60));
    console.log(`V1 API (Official):              ${v1Works ? '✅ WORKS' : '❌ FAILED'}`);
    console.log(`V2 API with Bearer Auth:        ${v2TokenWorks ? '✅ WORKS' : '❌ FAILED'}`);
    console.log(`V2 API with X-Token:            ${v2XTokenWorks ? '✅ WORKS' : '❌ FAILED'}`);
    console.log(`V2 Habits with Bearer:          ${v2HabitsWorks ? '✅ WORKS' : '❌ FAILED'}`);
    console.log('='.repeat(60));

    if (v2TokenWorks || v2XTokenWorks) {
        console.log('\n🎉 GREAT NEWS! V1 Token authentication works with V2 API!');
        console.log('You can use TickTick Token API credentials for V2 endpoints.');
        console.log('No need for session-based authentication!');
    } else {
        console.log('\n⚠️  V1 Token does NOT work with V2 API.');
        console.log('You need to use session-based authentication for V2 endpoints.');
    }
}

runAllTests().catch(console.error);
