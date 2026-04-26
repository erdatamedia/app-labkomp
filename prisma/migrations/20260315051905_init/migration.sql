-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "prodi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mataKuliah" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "jamMulai" TIMESTAMP(3) NOT NULL,
    "jamSelesai" TIMESTAMP(3) NOT NULL,
    "mingguMulai" INTEGER NOT NULL,
    "mingguSelesai" INTEGER NOT NULL,
    "software" TEXT NOT NULL,
    "jumlahMahasiswa" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "catatanAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
