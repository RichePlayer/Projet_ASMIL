-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "avatar_url" VARCHAR(255),
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "office" VARCHAR(100),
ADD COLUMN     "phone" VARCHAR(50);
