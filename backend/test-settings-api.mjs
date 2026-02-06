// Test script to verify Settings system is ready
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/v1';

// Test credentials (update these with your super admin credentials)
const TEST_CREDENTIALS = {
    email: 'admin@example.com', // Update this
    password: 'Admin@123' // Update this
};

async function testSettingsSystem() {
    console.log('🧪 Testing Settings System...\n');
    
    try {
        // Step 1: Login
        console.log('1️⃣  Attempting login...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_CREDENTIALS)
        });
        
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResponse.status, loginResponse.statusText);
            const errorData = await loginResponse.text();
            console.error('Error details:', errorData);
            return;
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login successful\n');
        
        const accessToken = loginData.data?.accessToken;
        if (!accessToken) {
            console.error('❌ No access token in response');
            return;
        }
        
        // Step 2: Test settings API
        console.log('2️⃣  Fetching settings...');
        const settingsResponse = await fetch(`${API_URL}/admin/settings`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!settingsResponse.ok) {
            console.error('❌ Settings API failed:', settingsResponse.status, settingsResponse.statusText);
            const errorData = await settingsResponse.text();
            console.error('Error details:', errorData);
            return;
        }
        
        const settingsData = await settingsResponse.json();
        console.log('✅ Settings fetched successfully\n');
        console.log('📊 Settings Data:', JSON.stringify(settingsData, null, 2));
        
        if (settingsData.success && settingsData.data) {
            console.log(`\n✅ Found ${settingsData.data.length} settings:`);
            settingsData.data.forEach(setting => {
                console.log(`   - ${setting.key}: "${setting.value}"`);
            });
        }
        
        console.log('\n✅ Settings system is working correctly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

console.log('⚠️  Make sure:');
console.log('   1. Backend server is running (npm start in backend folder)');
console.log('   2. Update TEST_CREDENTIALS with your super admin email/password\n');

testSettingsSystem();
