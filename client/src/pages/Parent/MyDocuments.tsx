"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ChildMaterials } from "./Dashboard/ChildMaterials"
import { parentChildService } from "../../services/parent/child-management/child.service"
import type { Child } from "../../services/parent/child-management/child.types"

export default function ParentMyDocumentsPage() {
  const route = useParams()
  const [params] = useSearchParams()
  const initialChildId = (route.childId as string) || params.get('childId') || ''
  const classId = params.get('classId') || undefined
  const [selectedChildId, setSelectedChildId] = useState<string>(initialChildId)

  const { data: childrenData } = useQuery({
    queryKey: ["parentChildren", { limit: 50 }],
    queryFn: () => parentChildService.getChildren({ limit: 50, page: 1 } as any),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const children = (childrenData as any as Child[]) || []

  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id)
    }
  }, [selectedChildId, children])

  return (
    <div className="p-4">
      {/* Simple child picker when accessed via /parent/my-documents without childId */}
      {children.length > 0 && (
        <div className="mb-4">
          <label className="mr-2 text-sm text-gray-600">Chọn học sinh:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedChildId || ""}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{(c as any).user?.fullName || c.id}</option>
            ))}
          </select>
        </div>
      )}

      <ChildMaterials childId={selectedChildId} classId={classId} />
    </div>
  )
}


