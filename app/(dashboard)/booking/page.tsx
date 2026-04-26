import { getSession } from '@/lib/session'
import BookingForm from './BookingForm'

export default async function BookingPage() {
  const session = await getSession()
  return <BookingForm userName={session?.name ?? ''} />
}
