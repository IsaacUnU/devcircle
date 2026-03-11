import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getGroup } from '@/lib/queries'
import { GroupPageClient } from '@/components/groups/GroupPageClient'

interface Props { params: { id: string } }

export default async function GroupPage({ params }: Props) {
  const [session, group] = await Promise.all([auth(), getGroup(params.id)])
  if (!group) notFound()

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
      <GroupPageClient
        group={group}
        currentUserId={session?.user?.id ?? null}
      />
    </div>
  )
}
