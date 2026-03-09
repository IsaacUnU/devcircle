'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { updateReputation } from './reputation'

export async function toggleVideoLike(videoId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const existing = await db.videoLike.findUnique({
    where: { userId_videoId: { userId: session.user.id, videoId } },
  })

  if (existing) {
    await db.videoLike.delete({ where: { id: existing.id } })

    // Reputation: -2 for the video author
    const video = await db.video.findUnique({ where: { id: videoId } })
    if (video) await updateReputation(video.authorId, -2)

  } else {
    await db.videoLike.create({
      data: { userId: session.user.id, videoId },
    })

    // Reputation: +2 for the video author
    const video = await db.video.findUnique({ where: { id: videoId } })
    if (video && video.authorId !== session.user.id) {
      await updateReputation(video.authorId, 2)
    }
  }

  revalidatePath('/clips')
  return { liked: !existing }
}

export async function getVideos(page = 1, limit = 10) {
  const session = await auth()
  const skip = (page - 1) * limit

  const videos = await db.video.findMany({
    where: { published: true },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, username: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
    },
  })

  return videos.map(v => ({
    ...v,
    liked: session?.user?.id ? (v.likes as any[]).length > 0 : false,
  }))
}

export async function incrementVideoView(videoId: string) {
  await db.video.update({
    where: { id: videoId },
    data: { views: { increment: 1 } },
  })
}

export async function createVideo(data: { title: string; description?: string; url: string; tags: string[] }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('No autenticado')

  const video = await db.video.create({
    data: {
      ...data,
      authorId: session.user.id,
    },
  })

  // Reputation: +10 for creating a clip
  await updateReputation(session.user.id, 10)

  revalidatePath('/clips')
  return video
}
