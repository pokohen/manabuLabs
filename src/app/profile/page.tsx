import { getServerAuthData } from '@/lib/server/auth'
import { StoreHydrator } from '@/components/StoreHydrator'
import ProfileClient from './_components/ProfileClient'

export default async function ProfilePage() {
  const { user, role, lastStudiedMenu, partner, category } = await getServerAuthData('/profile')

  return (
    <>
      <StoreHydrator user={user} role={role} lastStudiedMenu={lastStudiedMenu} partner={partner} category={category} />
      <ProfileClient user={user} />
    </>
  )
}
