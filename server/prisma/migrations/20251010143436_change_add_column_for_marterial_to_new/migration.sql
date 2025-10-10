-- DropForeignKey
ALTER TABLE "public"."materials" DROP CONSTRAINT "materials_uploaded_by_fkey";

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
