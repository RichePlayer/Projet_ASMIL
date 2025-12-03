/*
  Warnings:

  - You are about to drop the column `price` on the `formations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "formations" DROP COLUMN "price",
ADD COLUMN     "registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tuition_fee" DECIMAL(10,2) NOT NULL DEFAULT 0;
