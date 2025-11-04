"use client"

import { useQuery } from "@tanstack/react-query"
import { parentChildService } from "../../../../services"
import { ChildSchedule } from "../ChildSchedule/ChildSchedule"
import Loading from "../../../../components/Loading/LoadingPage"

export function ChildSchedulePage() {
  const { data: children, isLoading, error } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => parentChildService.getChildren(),
    staleTime: 30_000,
  })

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center p-6 text-destructive">
        Không thể tải dữ liệu học sinh. Vui lòng thử lại sau.
      </div>
    )
  }

  const firstChild = children?.[0]
  if (!firstChild) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Không có dữ liệu học sinh
      </div>
    )
  }

  return <ChildSchedule childId={firstChild.id} />
}