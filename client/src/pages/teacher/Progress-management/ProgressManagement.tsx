import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherProgressService, TeacherProgressReportDto } from '../../../services/teacher'
import { CheckCircle2 } from 'lucide-react'

export default function ProgressManagement() {
    const qc = useQueryClient()
    const [editing, setEditing] = useState<{ id: string; comment: string } | null>(null)
    const [selectedClass, setSelectedClass] = useState<string>('ALL')
    const [search, setSearch] = useState<string>('')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['teacher-progress-reports', { status: 'DRAFT' }],
        queryFn: () => teacherProgressService.list({ status: 'DRAFT' }),
        refetchOnWindowFocus: false,
        staleTime: 30_000,
    })

    const bulkPublishMutation = useMutation({
        mutationFn: async (reportIds: string[]) => {
            for (const id of reportIds) {
                await teacherProgressService.publish(id, {})
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teacher-progress-reports'] })
        },
    })

    const updateMutation = useMutation({
        mutationFn: (payload: { id: string; comment: string }) =>
            teacherProgressService.updateDraft(payload.id, { overallComment: payload.comment }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teacher-progress-reports'] })
            setEditing(null)
        },
    })

    const publishMutation = useMutation({
        mutationFn: (payload: { id: string; comment?: string }) =>
            teacherProgressService.publish(payload.id, payload.comment ? { overallComment: payload.comment } : {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['teacher-progress-reports'] })
        },
    })

    const reports = useMemo(() => {
        const arr = Array.isArray(data) ? data : (data as any)?.data ?? []
        return [...arr].sort((a: TeacherProgressReportDto, b: TeacherProgressReportDto) => a.periodLabel.localeCompare(b.periodLabel))
    }, [data])

    const classes = useMemo(() => {
        const uniqueClasses = new Map<string, string>()
        reports.forEach((r) => {
            if (r.class?.id) {
                uniqueClasses.set(r.class.id, r.class.name || r.class.id)
            }
        })
        return Array.from(uniqueClasses.entries()).map(([id, name]) => ({ id, name }))
    }, [reports])

    const filteredReports = useMemo(() => {
        const byClass = selectedClass === 'ALL' ? reports : reports.filter((r) => r.class?.id === selectedClass)
        const q = search.trim().toLowerCase()
        if (!q) return byClass
        return byClass.filter((r) => {
            const name = (r.student?.user?.fullName || '').toLowerCase()
            const code = (r.student?.studentCode || '').toLowerCase()
            return name.includes(q) || code.includes(q)
        })
    }, [reports, selectedClass, search])

    const handleBulkApprove = () => {
        if (filteredReports.length === 0) return
        if (!confirm(`Bạn có chắc muốn duyệt tất cả ${filteredReports.length} báo cáo?`)) return
        const ids = filteredReports.map((r) => r.id)
        bulkPublishMutation.mutate(ids)
    }

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Duyệt báo cáo tiến độ</h1>
                <div className="flex gap-2 items-center">
                    {classes.length > 0 && (
                        <select
                            className="px-3 py-2 text-sm rounded border bg-white"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="ALL">Tất cả lớp</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <input
                        className="px-3 py-2 text-sm rounded border bg-white w-56"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tên/mã học sinh"
                    />
                    <button
                        className="px-3 py-2 text-sm rounded bg-green-600 text-white disabled:bg-gray-300"
                        onClick={handleBulkApprove}
                        disabled={filteredReports.length === 0 || bulkPublishMutation.isPending}
                    >
                        {bulkPublishMutation.isPending ? 'Đang duyệt...' : `Duyệt tất cả (${filteredReports.length})`}
                    </button>
                </div>
            </div>

            {isLoading && <div>Đang tải...</div>}
            {isError && <div>Không tải được danh sách.</div>}

            {!isLoading && filteredReports.length === 0 && (
                <div className="text-gray-600">
                    {selectedClass === 'ALL'
                        ? 'Chưa có báo cáo nào chờ duyệt.'
                        : 'Không có báo cáo nào cho lớp này.'}
                </div>
            )}

            <div className="space-y-3">
                {filteredReports.map((r: TeacherProgressReportDto) => (
                    <div key={r.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">{r.periodLabel}</div>
                                <div className="font-medium">
                                    {r.class?.subject?.name || '—'}
                                    <span className="text-gray-500"> · Lớp: {r.class?.name || '—'}</span>
                                </div>
                                <div className="text-sm text-gray-600">Học sinh: {r.student?.user?.fullName || '—'}{r.student?.studentCode ? ` (${r.student.studentCode})` : ''}</div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span>
                                    Điểm: {r.averageScore ?? '—'} · Chuyên cần: {r.attendanceRate != null ? `${r.attendanceRate}%` : '—'}
                                </span>
                                {r.trend === 'up' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded border text-green-700 bg-green-50 border-green-200">↑ Tiến bộ</span>
                                )}
                                {r.trend === 'stable' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded border text-blue-700 bg-blue-50 border-blue-200">→ Ổn định</span>
                                )}
                                {r.trend === 'down' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded border text-red-700 bg-red-50 border-red-200">↓ Cần cải thiện</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-3">
                            {editing?.id === r.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm"
                                        rows={3}
                                        value={editing.comment}
                                        onChange={(e) => setEditing({ id: r.id, comment: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3 py-1 text-sm rounded bg-blue-600 text-white"
                                            onClick={() => updateMutation.mutate({ id: r.id, comment: editing.comment })}
                                        >
                                            Lưu nháp
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-neutral-800 hover:bg-neutral-900 text-white border border-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                            onClick={() => publishMutation.mutate({ id: r.id, comment: editing.comment })}
                                            disabled={publishMutation.isPending}
                                            title="Duyệt và công bố báo cáo này"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {publishMutation.isPending ? 'Đang công bố...' : 'Duyệt & Công bố'}
                                        </button>
                                        <button className="px-3 py-1 text-sm rounded bg-gray-200" onClick={() => setEditing(null)}>
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between gap-4">
                                    <p className="text-sm text-gray-800">
                                        Nhận xét: {r.overallComment || '—'}
                                    </p>
                                    <div className="shrink-0 flex gap-2">
                                        <button className="px-3 py-1 text-sm rounded bg-gray-100" onClick={() => setEditing({ id: r.id, comment: r.overallComment || '' })}>
                                            Sửa nhận xét
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-neutral-800 hover:bg-neutral-900 text-white border border-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                            onClick={() => publishMutation.mutate({ id: r.id })}
                                            disabled={publishMutation.isPending}
                                            title="Duyệt và công bố báo cáo này"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {publishMutation.isPending ? 'Đang công bố...' : 'Duyệt & Công bố'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}