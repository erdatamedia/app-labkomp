import { prisma } from '@/lib/prisma'

const bulanRomawi = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']

export const KODE_JENIS: Record<string, string> = {
  'KUL': 'Perkuliahan Rutin',
  'INS': 'Insidental',
  'PNL': 'Penelitian',
}

export const KODE_PRODI: Record<string, string> = {
  'Informatika': 'INF',
  'Teknik Sipil': 'TS',
  'Teknik Mesin': 'TM',
  'Teknik Elektro': 'TE',
}

export const KODE_LAB: Record<string, string> = {
  'Laboratorium Komputer': 'KOMP',
  'Laboratorium Struktur': 'STR',
  'Laboratorium Hidrolika': 'HID',
  'Laboratorium Manufaktur': 'MNF',
  'Laboratorium Kendali': 'KDL',
  'Laboratorium Sistem Tenaga': 'TEN',
}

export async function generateNomorSurat(
  prodi: string,
  jenis: string,
  namaLab: string,
): Promise<string> {
  const now   = new Date()
  const bulan = bulanRomawi[now.getMonth()]
  const tahun = now.getFullYear()

  const kodeProdi = KODE_PRODI[prodi] ?? prodi.slice(0, 3).toUpperCase()
  const kodeLab   = KODE_LAB[namaLab] ?? 'LAB'

  const count = await prisma.booking.count({
    where: {
      nomorSurat: { not: null },
      tanggalSurat: {
        gte: new Date(tahun, 0, 1),
        lt:  new Date(tahun + 1, 0, 1),
      },
    },
  })

  const urutan = String(count + 1).padStart(3, '0')
  return `${urutan}/${jenis}.${kodeProdi}-${kodeLab}/${bulan}/${tahun}`
}
