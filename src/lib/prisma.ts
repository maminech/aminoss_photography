import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Force type inference to include all models
export const prisma = (global.prisma || new PrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
