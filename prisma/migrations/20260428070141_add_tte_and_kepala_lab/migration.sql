-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "jabatanKepalaLab" TEXT DEFAULT 'Kepala Laboratorium Komputer',
ADD COLUMN     "namaKepalaLab" TEXT,
ADD COLUMN     "nipKepalaLab" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isTTE" BOOLEAN NOT NULL DEFAULT false;
