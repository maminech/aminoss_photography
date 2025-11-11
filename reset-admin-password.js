const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');

    const newPassword = 'admin123'; // Simple password for now
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await prisma.user.update({
      where: { email: 'admin@admin.com' },
      data: { 
        password: hashedPassword,
        role: 'ADMIN' // Ensure role is ADMIN
      }
    });

    console.log('✅ Password reset successful!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 ADMIN LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    admin@admin.com`);
    console.log(`🔑 Password: admin123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login at: /admin/login\n');
    console.log('⚠️  IMPORTANT: Change this password after logging in!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
