/*
  Warnings:

  - You are about to drop the column `hashedAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "hashedAt",
ADD COLUMN     "hashedRt" TEXT;
