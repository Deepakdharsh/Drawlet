import { PrismaClient } from "@prisma/client";

export const prismaClient=new PrismaClient()


// async function checkDbConnection() {
//   try {
//     await prismaClient.$connect();
//     console.log("✅ Database connected successfully.");
//   } catch (error) {
//     console.error("❌ Database connection failed:", error);
//   }
// }

// checkDbConnection()