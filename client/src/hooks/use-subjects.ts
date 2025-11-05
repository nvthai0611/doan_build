import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '@/services/center-owner/subject-management/subject.service'
import type { SubjectItem, CreateSubjectDto, UpdateSubjectDto } from '@/services/center-owner/subject-management/subject.types'

export type Subject = SubjectItem

export function useSubjects() {
  const queryClient = useQueryClient()

  const subjectsQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const addMutation = useMutation({
    mutationFn: (data: CreateSubjectDto) => subjectService.createSubject(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectDto }) => subjectService.updateSubject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectService.deleteSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  })

  return {
    subjects: (subjectsQuery.data || []) as Subject[],
    isLoading: subjectsQuery.isLoading,
    addSubject: async (data: CreateSubjectDto) => addMutation.mutateAsync(data),
    updateSubject: async (id: string, data: UpdateSubjectDto) => updateMutation.mutateAsync({ id, data }),
    deleteSubject: async (id: string) => deleteMutation.mutateAsync(id),
  }
}


