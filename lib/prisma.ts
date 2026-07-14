process.env.PRISMA_CLIENT_ENGINE_TYPE = "library";
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Di Prisma 5, cukup gunakan instance PrismaClient biasa
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
