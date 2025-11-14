const { PrismaClient } = require('@prisma/client');

async function clearPosts() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.instagramPost.deleteMany();
    console.log(`✅ Deleted ${result.count} Instagram posts`);
  } finally {
    await prisma.$disconnect();
  }
}

clearPosts();
