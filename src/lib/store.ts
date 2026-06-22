import { create } from 'zustand'
import type { FamilyMember, Event, RSVP, User } from '@/types'

interface AppState {
  // Auth
  user: User | null
  isLoading: boolean
  error: string | null

  // Members
  members: FamilyMember[]
  currentMember: FamilyMember | null

  // Events
  events: Event[]
  currentEvent: Event | null

  // RSVP
  rsvpList: RSVP[]

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMembers: (members: FamilyMember[]) => void
  setCurrentMember: (member: FamilyMember | null) => void
  setEvents: (events: Event[]) => void
  setCurrentEvent: (event: Event | null) => void
  setRsvpList: (rsvps: RSVP[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  members: [],
  currentMember: null,
  events: [],
  currentEvent: null,
  rsvpList: [],

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setMembers: (members) => set({ members }),
  setCurrentMember: (member) => set({ currentMember: member }),
  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setRsvpList: (rsvps) => set({ rsvpList: rsvps }),
}))
