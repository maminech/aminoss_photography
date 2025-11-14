// Load environment variables
require('dotenv').config({ path: '.env.local' });

const INSTAGRAM_USER_ID = '25647122651552556';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

console.log('🔍 Testing Instagram Access Token...\n');
console.log('User ID:', INSTAGRAM_USER_ID);
console.log('Token (first 50 chars):', ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 50) + '...' : 'NOT FOUND');
console.log('Token length:', ACCESS_TOKEN ? ACCESS_TOKEN.length : 0);
console.log('\n');

async function testToken() {
  try {
    // Simple test - get user info
    const url = `https://graph.instagram.com/me?fields=id,username&access_token=${ACCESS_TOKEN}`;
    console.log('Testing URL:', url.replace(ACCESS_TOKEN, 'TOKEN_HIDDEN'), '\n');
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.log('\n❌ Token is invalid or expired!');
      console.log('Error:', data.error.message);
      console.log('\n💡 You need to generate a new Long-Lived Access Token');
      console.log('Visit: https://developers.facebook.com/tools/explorer/');
    } else {
      console.log('\n✅ Token is valid!');
      console.log('Username:', data.username);
      console.log('ID:', data.id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testToken();
