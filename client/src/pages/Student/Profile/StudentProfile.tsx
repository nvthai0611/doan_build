import { useQuery } from '@tanstack/react-query'
import { studentProfileService } from '../../../services/student/profile/profile.service'
import type { StudentProfile } from '../../../services/student/profile/profile.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '../../../utils/format'

export default function StudentProfilePage() {
  

  const { data, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => studentProfileService.getProfile(),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  })

  const profile = (data as StudentProfile | undefined)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Hồ sơ học sinh</h1>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Đang tải thông tin...</div>
      ) : !profile ? (
        <div className="text-sm text-muted-foreground">Không tìm thấy thông tin học sinh.</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin học sinh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{profile.fullName?.slice(0, 1) || 'S'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-lg font-semibold">{profile.fullName || profile.email}</div>
                <div className="text-sm text-muted-foreground">{profile.email}</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">Role: student</Badge>
                  {profile?.enrollments?.[0]?.class?.name && (
                    <Badge>Lớp: {profile.enrollments[0].class.name}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Họ tên</div>
                <div className="font-medium">{profile.fullName || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{profile.email || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Số điện thoại</div>
                <div className="font-medium">{profile.phone || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Ngày sinh</div>
                <div className="font-medium">{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Giới tính</div>
                <div className="font-medium">{profile.gender === 'male' ? 'Nam' : profile.gender === 'female' ? 'Nữ' : profile.gender === 'other' ? 'Khác' : '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Địa chỉ</div>
                <div className="font-medium">{profile.address || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Khối/Lớp (cấp học)</div>
                <div className="font-medium">{profile.grade || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Trường</div>
                <div className="font-medium">{profile.school?.name || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Trạng thái</div>
                <div className="font-medium">{profile.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</div>
              </div>
            </div>

            

            {/* Phụ huynh đã liên kết */}
            <div className="mt-8">
              <div className="text-base font-semibold mb-3">Phụ huynh đã liên kết</div>
              {!profile.parentLinks || profile.parentLinks.length === 0 ? (
                <div className="text-sm text-muted-foreground">Chưa có phụ huynh liên kết.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {profile.parentLinks.map((link) => (
                    <Card key={link.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {link.parent?.user?.fullName || link.parent?.user?.email || 'Phụ huynh'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {link.parent?.user?.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {link.parent?.user?.phone || '-'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {link.relation && <Badge variant="outline">Quan hệ: {link.relation}</Badge>}
                            {link.primaryContact && <Badge>Liên hệ chính</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


