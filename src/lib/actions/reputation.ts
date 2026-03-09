'use server'

import { db } from '@/lib/db'

export async function updateReputation(userId: string, points: number) {
    try {
        await db.user.update({
            where: { id: userId },
            data: { reputation: { increment: points } },
        })

        // If points are significant, we could notify the user, 
        // but for now let's just update the value.
    } catch (e) {
        console.error('Error updating reputation:', e)
    }
}
