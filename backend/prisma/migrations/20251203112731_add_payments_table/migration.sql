/*
  Warnings:

  - You are about to drop the column `enrollment_date` on the `students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "enrollment_date" DATE DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "enrollment_date";
