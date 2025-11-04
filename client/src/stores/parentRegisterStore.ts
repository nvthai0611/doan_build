import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Child {
  id: string
  fullName: string
  dateOfBirth: string
  gender: string
  schoolId: string
}

export interface ParentFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  relationshipType: string
}

interface ParentRegisterState {
  formData: ParentFormData
  children: Child[]
  
  // Actions
  setFormData: (data: Partial<ParentFormData>) => void
  setChildren: (children: Child[]) => void
  addChild: () => void
  removeChild: (id: string) => void
  updateChild: (id: string, field: keyof Omit<Child, 'id'>, value: string) => void
  resetForm: () => void
}

const initialFormData: ParentFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phone: '',
  relationshipType: '',
}

const initialChild: Child = {
  id: crypto.randomUUID(),
  fullName: '',
  dateOfBirth: '',
  gender: '',
  schoolId: '',
}

export const useParentRegisterStore = create<ParentRegisterState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      children: [initialChild],

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setChildren: (children) =>
        set({ children }),

      addChild: () =>
        set((state) => ({
          children: [
            ...state.children,
            {
              id: crypto.randomUUID(),
              fullName: '',
              dateOfBirth: '',
              gender: '',
              schoolId: '',
            },
          ],
        })),

      removeChild: (id) =>
        set((state) => ({
          children: state.children.filter((child) => child.id !== id),
        })),

      updateChild: (id, field, value) =>
        set((state) => ({
          children: state.children.map((child) =>
            child.id === id ? { ...child, [field]: value } : child
          ),
        })),

      resetForm: () =>
        set({
          formData: initialFormData,
          children: [
            {
              id: crypto.randomUUID(),
              fullName: '',
              dateOfBirth: '',
              gender: '',
              schoolId: '',
            },
          ],
        }),
    }),
    {
      name: 'parent-register-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist form data and children, not other state
      partialize: (state) => ({
        formData: state.formData,
        children: state.children,
      }),
    }
  )
)

