// Tipos y constantes de privacidad — sin 'use server' para poder importarlos en cualquier sitio

export interface PrivacySettings {
  isPrivate:       boolean
  showFollowers:   'everyone' | 'followers' | 'nobody'
  showFollowing:   'everyone' | 'followers' | 'nobody'
  whoCanMessage:   'everyone' | 'followers' | 'nobody'
  whoCanComment:   'everyone' | 'followers' | 'nobody'
}

export const DEFAULT_PRIVACY: PrivacySettings = {
  isPrivate:     false,
  showFollowers: 'everyone',
  showFollowing: 'everyone',
  whoCanMessage: 'everyone',
  whoCanComment: 'everyone',
}
