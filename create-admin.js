const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('🔧 Admin Account Creator\n');

    // Check existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    console.log(`📊 Found ${existingUsers.length} existing user(s):\n`);
    existingUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.role}) - ${user.name || 'No name'}`);
    });
    console.log('');

    const choice = await question('Choose an option:\n1. Promote existing user to ADMIN\n2. Create new ADMIN user\n3. Delete all users and start fresh\nEnter choice (1/2/3): ');

    if (choice === '1') {
      // Promote existing user
      if (existingUsers.length === 0) {
        console.log('❌ No users to promote');
        rl.close();
        return;
      }

      const userIndex = await question(`Enter user number to promote (1-${existingUsers.length}): `);
      const selectedUser = existingUsers[parseInt(userIndex) - 1];

      if (!selectedUser) {
        console.log('❌ Invalid selection');
        rl.close();
        return;
      }

      await prisma.user.update({
        where: { id: selectedUser.id },
        data: { role: 'ADMIN' }
      });

      console.log(`✅ Successfully promoted ${selectedUser.email} to ADMIN!`);
      console.log(`\n🔐 Login at: /admin/login`);
      console.log(`   Email: ${selectedUser.email}`);
      console.log(`   Password: (use the password you set for this user)`);

    } else if (choice === '2') {
      // Create new admin
      const email = await question('Enter admin email: ');
      const name = await question('Enter admin name: ');
      const password = await question('Enter admin password: ');

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      console.log('\n✅ Admin account created successfully!');
      console.log(`\n🔐 Login credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`\n🌐 Login at: /admin/login`);

    } else if (choice === '3') {
      // Delete all and create fresh
      const confirm = await question('⚠️  This will DELETE all users! Type "DELETE" to confirm: ');
      
      if (confirm !== 'DELETE') {
        console.log('❌ Cancelled');
        rl.close();
        return;
      }

      await prisma.user.deleteMany({});
      console.log('🗑️  All users deleted');

      const email = await question('Enter new admin email: ');
      const name = await question('Enter new admin name: ');
      const password = await question('Enter new admin password: ');

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      console.log('\n✅ Fresh admin account created!');
      console.log(`\n🔐 Login credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`\n🌐 Login at: /admin/login`);

    } else {
      console.log('❌ Invalid choice');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createAdmin();
