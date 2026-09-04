-- AlterTable
ALTER TABLE "trainer_profiles" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Backfill existing trainer names
UPDATE "trainer_profiles" SET "name" = TRIM(CONCAT("first_name", ' ', "last_name"));

-- Remove default constraint
ALTER TABLE "trainer_profiles" ALTER COLUMN "name" DROP DEFAULT;

-- Drop old columns
ALTER TABLE "trainer_profiles" DROP COLUMN "first_name",
DROP COLUMN "last_name";
