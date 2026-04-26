-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'WD2_ACC';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'WD2';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "catatanWD2" TEXT,
ADD COLUMN     "nomorSurat" TEXT,
ADD COLUMN     "tanggalSurat" TIMESTAMP(3);
