import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"

interface StudentParentInfoCardProps {
  student: any
}

export function StudentParentInfoCard({ student }: StudentParentInfoCardProps) {
  const hasParentInfo = student?.parent && Object.keys(student.parent).length > 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Thông tin phụ huynh</h2>
          {/* <Button variant="ghost" size="icon">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </Button> */}
        </div>

        {hasParentInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tên phụ huynh</p>
              <p className="text-sm font-medium text-foreground">{student?.parent?.user?.fullName || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
              <p className="text-sm font-medium text-foreground">{student?.parent?.user?.phone || 'Chưa cập nhật'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium text-foreground">{student?.parent?.user?.email || 'Chưa cập nhật'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Mối quan hệ</p>
              <p className="text-sm font-medium text-foreground">{student?.parent?.relation || 'N/A'}</p>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 opacity-30">
              <svg
                width="200"
                height="150"
                viewBox="0 0 200 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="20" y="20" width="160" height="100" rx="8" fill="#E5E7EB" />
                <rect x="30" y="30" width="50" height="8" rx="4" fill="#D1D5DB" />
                <rect x="30" y="45" width="80" height="8" rx="4" fill="#D1D5DB" />
                <rect x="30" y="60" width="60" height="8" rx="4" fill="#D1D5DB" />
                <circle cx="150" cy="50" r="15" fill="#D1D5DB" />
                <rect x="30" y="85" width="140" height="25" rx="4" fill="#F3F4F6" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">Chưa có thông tin phụ huynh</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}