export interface AffectedSessionItem {
  id: string
  date: string
  time: string
  className: string
  room: string
  selected: boolean
  replacementTeacherId?: string
}

export interface AffectedSessionsParams {
  startDate: string
  endDate: string
}

