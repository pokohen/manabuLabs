import { redirect } from 'next/navigation'
import { getServerAuthData } from '@/lib/server/auth'
import { StoreHydrator } from '@/components/StoreHydrator'
import AdminDashboardClient from './_components/AdminDashboardClient'

export default async function AdminPage() {
  const { user, role, lastStudiedMenu, partner, category } = await getServerAuthData('/admin')

  if (role !== 'admin') {
    redirect('/')
  }

  return (
    <>
      <StoreHydrator user={user} role={role} lastStudiedMenu={lastStudiedMenu} partner={partner} category={category} />
      <AdminDashboardClient />
    </>
  )
}
