import { PrismaClient, Role, BookingStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcrypt"

const pool    = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma  = new PrismaClient({ adapter })

function dt(time: string) {
  return new Date(`1970-01-01T${time}:00`)
}

async function main() {
  const hashAdmin = await bcrypt.hash("admin123", 10)
  const hashDosen = await bcrypt.hash("dosen123", 10)
  const hashWD2   = await bcrypt.hash("wd2123",   10)

  // ── Users (upsert by email) ─────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: "admin@lab.com" },
    update: { name: "Admin Lab", password: hashAdmin, role: Role.ADMIN, nip: "197801012005011001", jabatan: "Kepala Laboratorium Komputer" },
    create: { name: "Admin Lab", email: "admin@lab.com", password: hashAdmin, role: Role.ADMIN, nip: "197801012005011001", jabatan: "Kepala Laboratorium Komputer" },
  })

  const budi = await prisma.user.upsert({
    where:  { email: "budi@lab.com" },
    update: { name: "Dr. Budi Santoso", password: hashDosen, role: Role.DOSEN, nip: "198503152010011002", prodi: "Informatika", noHp: "08123456789" },
    create: { name: "Dr. Budi Santoso", email: "budi@lab.com", password: hashDosen, role: Role.DOSEN, nip: "198503152010011002", prodi: "Informatika", noHp: "08123456789" },
  })

  const siti = await prisma.user.upsert({
    where:  { email: "siti@lab.com" },
    update: { name: "Dr. Siti Rahayu", password: hashDosen, role: Role.DOSEN, nip: "199001202015012003", prodi: "Sistem Informasi", noHp: "08234567890" },
    create: { name: "Dr. Siti Rahayu", email: "siti@lab.com", password: hashDosen, role: Role.DOSEN, nip: "199001202015012003", prodi: "Sistem Informasi", noHp: "08234567890" },
  })

  await prisma.user.upsert({
    where:  { email: "wd2@lab.com" },
    update: { name: "Dr. Ahmad Fauzi, M.T.", password: hashWD2, role: Role.WD2, nip: "197605102003121001", jabatan: "Wakil Dekan II Bidang Sumber Daya", noHp: "08345678901" },
    create: { name: "Dr. Ahmad Fauzi, M.T.", email: "wd2@lab.com", password: hashWD2, role: Role.WD2, nip: "197605102003121001", jabatan: "Wakil Dekan II Bidang Sumber Daya", noHp: "08345678901" },
  })

  // ── AppSettings singleton ───────────────────────────────────────────
  await prisma.appSettings.upsert({
    where:  { id: 'singleton' },
    update: {},
    create: {
      id:           'singleton',
      namaInstansi: 'Universitas Brawijaya',
      namaFakultas: 'Fakultas Teknik',
      namaJurusan:  'Teknik Informatika',
      alamat:       'Jl. MT. Haryono No.167, Malang',
    },
  })

  // ── Bookings (delete then recreate for idempotency) ─────────────────
  await prisma.booking.deleteMany({
    where: { userId: { in: [budi.id, siti.id] } },
  })

  type BookingInput = {
    userId: number
    mataKuliah: string
    prodi: string
    hari: string
    jamMulai: Date
    jamSelesai: Date
    software: string
    mingguMulai: number
    mingguSelesai: number
    status: BookingStatus
    jumlahMahasiswa?: number
    nomorSurat?: string
    tanggalSurat?: Date
    catatanWD2?: string
  }

  const bookings: BookingInput[] = [
    {
      userId: budi.id, mataKuliah: "Pemrograman Web",
      prodi: "Informatika", hari: "Senin",
      jamMulai: dt("08:00"), jamSelesai: dt("10:00"),
      software: "VS Code, Node.js",
      mingguMulai: 3, mingguSelesai: 7,
      status: BookingStatus.PENDING,
    },
    {
      userId: budi.id, mataKuliah: "Struktur Data",
      prodi: "Informatika", hari: "Rabu",
      jamMulai: dt("13:00"), jamSelesai: dt("15:00"),
      software: "Code::Blocks",
      mingguMulai: 3, mingguSelesai: 3,
      status: BookingStatus.PENDING,
    },
    {
      userId: siti.id, mataKuliah: "Basis Data",
      prodi: "Sistem Informasi", hari: "Selasa",
      jamMulai: dt("10:00"), jamSelesai: dt("12:00"),
      software: "MySQL Workbench",
      mingguMulai: 2, mingguSelesai: 6,
      status: BookingStatus.APPROVED,
    },
    {
      userId: siti.id, mataKuliah: "Kecerdasan Buatan",
      prodi: "Informatika", hari: "Kamis",
      jamMulai: dt("08:00"), jamSelesai: dt("10:00"),
      software: "Python, Jupyter",
      mingguMulai: 4, mingguSelesai: 8,
      status: BookingStatus.APPROVED,
    },
    {
      userId: budi.id, mataKuliah: "Jaringan Komputer",
      prodi: "Teknik Informatika", hari: "Jumat",
      jamMulai: dt("13:00"), jamSelesai: dt("15:00"),
      software: "Cisco Packet Tracer",
      mingguMulai: 2, mingguSelesai: 2,
      status: BookingStatus.REJECTED,
    },
    {
      userId: budi.id, mataKuliah: "Sistem Operasi",
      prodi: "Informatika", hari: "Selasa",
      jamMulai: dt("10:00"), jamSelesai: dt("12:00"),
      software: "VMware Workstation",
      mingguMulai: 5, mingguSelesai: 5,
      status: BookingStatus.WD2_ACC,
      nomorSurat:   "B/123/WD2/IV/2025",
      tanggalSurat: new Date(),
      catatanWD2:   "Disetujui untuk penggunaan lab jaringan",
    },
  ]

  await prisma.booking.createMany({ data: bookings })

  console.log("✓ Seed selesai")
  console.log("  Users   : admin@lab.com (admin123) | budi@lab.com (dosen123) | siti@lab.com (dosen123) | wd2@lab.com (wd2123)")
  console.log("  Booking : 6 (2 PENDING, 2 APPROVED, 1 REJECTED, 1 WD2_ACC)")
  console.log("  Settings: Universitas Brawijaya · Fakultas Teknik · Teknik Informatika")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
