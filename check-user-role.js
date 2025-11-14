const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    console.log('🔍 Checking user roles in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`📊 Total users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`User #${index + 1}:`);
      console.log(`  📧 Email: ${user.email}`);
      console.log(`  👤 Name: ${user.name}`);
      console.log(`  🔐 Role: ${user.role || 'NOT SET (NULL)'}`);
      console.log(`  🆔 ID: ${user.id}`);
      console.log(`  📅 Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log('');
    });

    // Check if admin user exists
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
    } else {
      console.log('❌ No admin user found!');
      console.log('💡 You need to set a user role to "admin" in the database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
