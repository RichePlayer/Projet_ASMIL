/*
  Warnings:

  - You are about to drop the column `category_id` on the `formations` table. All the data in the column will be lost.
  - You are about to drop the column `formation_id` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "formations" DROP CONSTRAINT "formations_category_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_formation_id_fkey";

-- AlterTable
ALTER TABLE "formations" DROP COLUMN "category_id",
ADD COLUMN     "category" VARCHAR(100);

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "formation_id",
ADD COLUMN     "module_id" INTEGER;

-- DropTable
DROP TABLE "categories";

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
