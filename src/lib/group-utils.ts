export const GROUP_CREATION_REQUIREMENTS = {
  USER:      { minDays: 30 },
  DEVELOPER: { minDays: 7 },
  ADMIN:     { minDays: 0 },
} as const

export type EligibilityResult = {
  eligible: boolean
  daysActive: number
  daysRequired: number
  daysRemaining: number
}

export function canCreateGroup(user: { role: string; createdAt: Date }): EligibilityResult {
  const role = user.role as keyof typeof GROUP_CREATION_REQUIREMENTS
  const daysRequired = (GROUP_CREATION_REQUIREMENTS[role] ?? GROUP_CREATION_REQUIREMENTS.USER).minDays
  const daysActive = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, daysRequired - daysActive)
  return { eligible: daysRemaining === 0, daysActive, daysRequired, daysRemaining }
}
