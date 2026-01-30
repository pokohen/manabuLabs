import { getServerAuthData } from '@/lib/server/auth'
import { StoreHydrator } from '@/components/StoreHydrator'
import WordSentenceClient from './_components/WordSentenceClient'

export default async function WordSentencePage() {
  const { user, role, lastStudiedMenu, partner, category } = await getServerAuthData('/word-sentence')

  return (
    <>
      <StoreHydrator user={user} role={role} lastStudiedMenu={lastStudiedMenu} partner={partner} category={category} />
      <WordSentenceClient userId={user.id} />
    </>
  )
}
