const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'innov8.tn@gmail.com';
    const newPassword = 'Hunter990000';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('✓ Password updated for:', email);
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin',
          role: 'admin'
        }
      });
      console.log('✓ Admin user created:', email);
    }

    console.log('You can now login with:');
    console.log('Email:', email);
    console.log('Password:', newPassword);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

