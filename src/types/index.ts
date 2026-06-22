export interface FamilyMember {
  id: string
  name: string
  nickname?: string
  photoUrl?: string
  birthDate?: string
  gender?: 'M' | 'F'
  industry?: string
  phone?: string
  lineId?: string
  email?: string
  notes?: string
  relations: {
    fatherId?: string
    motherId?: string
    spouseId?: string
    childrenIds?: string[]
  }
  userId?: string
  isDataComplete: boolean
  dataCompletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email?: string
  authProvider: 'email' | 'google' | 'line'
  memberId: string
  isAdmin: boolean
  createdAt: string
  lastLoginAt: string
}

export interface Event {
  id: string
  name: string
  date: string
  time: string
  location: string
  address?: string
  mapUrl?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published' | 'finished'
  rsvpList?: RSVP[]
  photos?: string[]
  summary?: string
}

export interface RSVP {
  id: string
  eventId: string
  memberId: string
  status: 'pending' | 'attending' | 'not-attending'
  respondedAt?: string
  notes?: string
}

export type AuthProvider = 'email' | 'google' | 'line'
