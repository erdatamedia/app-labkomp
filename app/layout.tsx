import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { prisma } from '@/lib/prisma'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.appSettings.findUnique({
    where: { id: 'singleton' },
    select: { logoUrl: true, namaInstansi: true },
  })

  const faviconUrl = settings?.logoUrl ?? '/favicon.svg'

  return {
    title: settings?.namaInstansi
      ? `Sistem Booking Lab — ${settings.namaInstansi}`
      : 'Sistem Booking Lab Komputer',
    description: 'Sistem peminjaman laboratorium komputer',
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
