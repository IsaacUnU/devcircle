'use server'

import { getFeed } from '@/lib/queries'

export async function fetchMoreFeed(page: number, limit = 10) {
    const data = await getFeed(page, limit)
    return {
        posts: data.posts,
        hasMore: data.hasMore
    }
}
