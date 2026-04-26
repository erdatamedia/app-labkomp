-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "jabatan" TEXT,
ADD COLUMN     "nip" TEXT,
ADD COLUMN     "noHp" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "namaInstansi" TEXT NOT NULL DEFAULT 'Universitas',
    "namaFakultas" TEXT NOT NULL DEFAULT 'Fakultas Teknik',
    "namaJurusan" TEXT NOT NULL DEFAULT 'Teknik Informatika',
    "logoUrl" TEXT,
    "alamat" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
