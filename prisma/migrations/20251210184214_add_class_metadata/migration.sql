/*
  Warnings:

  - Added the required column `grade` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segment` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'FULLTIME');

-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO');

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_teacherId_fkey";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "grade" TEXT NOT NULL,
ADD COLUMN     "segment" "Segment" NOT NULL,
ADD COLUMN     "shift" "Shift" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
