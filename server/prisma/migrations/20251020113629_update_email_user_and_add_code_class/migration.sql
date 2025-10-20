-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
