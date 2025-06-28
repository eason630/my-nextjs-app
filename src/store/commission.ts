import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Person {
  id: string
  name: string
  profit: number
  month: string
}

export interface PersonWithResult extends Person {
  result: CommissionResult
}

export interface CommissionResult {
  baseSalary: number
  commission: number
  tax: number
  cost: number
  final: number
  detail: string
}

interface CommissionState {
  people: Person[]
  addPerson: () => void
  removePerson: (id: string) => void
  updatePerson: (id: string, data: Partial<Omit<Person, 'id'>>) => void
  reset: () => void
}

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const defaultPerson = (): Person => ({
  id: Math.random().toString(36).slice(2),
  name: '',
  profit: 0,
  month: getCurrentMonth(),
})

export const useCommissionStore = create<CommissionState>()(
  persist(
    (set) => ({
      people: [defaultPerson()],
      addPerson: () => set((state) => ({ people: [...state.people, defaultPerson()] })),
      removePerson: (id) => set((state) => ({ people: state.people.length === 1 ? state.people : state.people.filter(p => p.id !== id) })),
      updatePerson: (id, data) => set((state) => ({ people: state.people.map(p => p.id === id ? { ...p, ...data } : p) })),
      reset: () => set({ people: [defaultPerson()] }),
    }),
    { name: 'commission-storage' }
  )
) 