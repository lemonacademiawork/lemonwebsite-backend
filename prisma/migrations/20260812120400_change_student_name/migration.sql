-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Backfill existing student names
UPDATE "student_profiles" SET "name" = TRIM(CONCAT("first_name", ' ', "last_name"));

-- Remove default constraint
ALTER TABLE "student_profiles" ALTER COLUMN "name" DROP DEFAULT;

-- Drop old columns
ALTER TABLE "student_profiles" DROP COLUMN "first_name",
DROP COLUMN "last_name";
