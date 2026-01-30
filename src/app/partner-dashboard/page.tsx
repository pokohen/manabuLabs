import { redirect } from 'next/navigation'
import { getServerAuthData } from '@/lib/server/auth'
import { StoreHydrator } from '@/components/StoreHydrator'
import PartnerDashboardClient from './_components/PartnerDashboardClient'

export default async function PartnerDashboardPage() {
  const { user, role, lastStudiedMenu, partner, category } = await getServerAuthData('/partner-dashboard')

  if (!partner || !category) {
    redirect('/')
  }

  return (
    <>
      <StoreHydrator user={user} role={role} lastStudiedMenu={lastStudiedMenu} partner={partner} category={category} />
      <PartnerDashboardClient partner={partner} category={category} />
    </>
  )
}
