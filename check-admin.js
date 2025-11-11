const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin users in database...\n');

    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in database.');
      console.log('\n📝 To create an admin account, visit:');
      console.log('   /admin/setup\n');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
      
      adminUsers.forEach((user, index) => {
        console.log(`Admin #${index + 1}:`);
        console.log(`  📧 Email: ${user.email}`);
        console.log(`  👤 Name: ${user.name || 'Not set'}`);
        console.log(`  🆔 ID: ${user.id}`);
        console.log(`  📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });

      console.log('⚠️  Note: Passwords are hashed and cannot be displayed.');
      console.log('💡 If you forgot your password, use the password reset feature.');
    }

    // Also check total users
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Make sure your .env file has the correct DATABASE_URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
