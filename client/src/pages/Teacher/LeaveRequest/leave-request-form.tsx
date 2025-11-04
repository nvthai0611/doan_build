'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AffectedSessionsTable } from './affected-sessions-table';
import { ConfirmationModal } from './confirmation-modal';
import { Calendar, Loader2 } from 'lucide-react';
import { teacherLeaveRequestService } from '../../../services/teacher/leave-request/leave.service';
import { teacherCommonService } from '../../../services/teacher/common/common.service';
import Loading from '../../../components/Loading/LoadingPage';
import { toast } from 'sonner';

export interface AffectedSessionItem {
  id: string;
  date: string;
  time: string;
  className: string;
  room: string;
  selected: boolean;
  replacementTeacherId?: string;
}

export function LeaveRequestForm() {
  const [teacherName, setTeacherName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [affectedSessions, setAffectedSessions] = useState<AffectedSessionItem[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAffectedSessionsLoading, setIsAffectedSessionsLoading] = useState(false);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      const data = await teacherCommonService.getTeacherInfo();
      setTeacherName(data.user.fullName);
    };
    fetchTeacherInfo();
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const fetchAffected = async () => {
      if (!startDate || !endDate) {
        setAffectedSessions([]);
        return;
      }
      try {
        setIsAffectedSessionsLoading(true);
        const data = await teacherLeaveRequestService.getAffectedSessions({ startDate, endDate });
        if (!isCancelled) {
          setAffectedSessions(data as unknown as AffectedSessionItem[]);
        }
      } catch (err) {
        if (!isCancelled) {
          setAffectedSessions([]);
          console.error('Failed to load affected sessions', err);
        } 
      } finally {
        setIsAffectedSessionsLoading(false);
      }
    };
    fetchAffected();
    return () => {
      isCancelled = true;
    };
  }, [startDate, endDate]);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setImage(file);

  //     // Create preview for images
  //     if (file.type.startsWith('image/')) {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setImagePreview(reader.result as string);
  //       };
  //       reader.readAsDataURL(file);
  //     } else {
  //       setImagePreview(null);
  //     }
  //   }
  // };

  // const removeAttachment = () => {
  //   setImage(null);
  //   setImagePreview(null);
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    //check if selected session is not select a replacement teacher
    // if (affectedSessions.some((s) => !s.replacementTeacherId)) {
    //   toast.error('Vui lòng chọn giáo viên thay thế cho tất cả các buổi học');
    //   return;
    // }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('Ngày kết thúc không được trước ngày bắt đầu');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      // TODO: Implement API call to create LeaveRequest

      await teacherLeaveRequestService.createLeaveRequest({
        leaveType,
        startDate,
        endDate,
        reason,
        affectedSessions: affectedSessions.filter((s) => s.selected) as AffectedSessionItem[],
      });

      // console.log({
      //   leaveType,
      //   startDate,
      //   endDate,
      //   reason,
      //   image: image as File,
      //   affectedSessions: affectedSessions.filter((s) => s.selected) as AffectedSessionItem[],
      // });

      toast.success('Đơn xin nghỉ của bạn đã được gửi thành công!');
      resetForm();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi đơn xin nghỉ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setAffectedSessions([]);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 min-h-screen px-4 py-6">
        <div className="max-w-7xl mx-auto ">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Đơn xin nghỉ của giáo viên
            </h1>
            <p className="text-muted-foreground text-base mt-2">
              Vui lòng điền thông tin xin nghỉ và kiểm tra các buổi học bị ảnh
              hưởng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section - 1/2 width */}
            <div>
              <Card className="shadow-xl border rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground pb-8 rounded-t-2xl">
                  <CardTitle className="text-2xl font-bold">
                    Thông tin đơn xin nghỉ
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                    <div className="grid grid-cols-1  gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          Họ và tên
                        </Label>
                        <Input
                          value={teacherName}
                          readOnly
                          className="bg-muted border"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t">
                      <div className="space-y-2">
                        <Label
                          htmlFor="leaveType"
                          className="text-sm font-medium text-foreground"
                        >
                          Loại nghỉ <span className="text-destructive">*</span>
                        </Label>
                        <Select value={leaveType} onValueChange={setLeaveType}>
                          <SelectTrigger id="leaveType" className="border">
                            <SelectValue placeholder="Chọn loại nghỉ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal_leave">
                              Lý do cá nhân
                            </SelectItem>
                            <SelectItem value="sick_leave">Nghỉ ốm</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        {leaveType === 'sick_leave' && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4" />
                            Nên đính kèm giấy xác nhận y tế (nếu có)
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="startDate"
                            className="text-sm font-medium text-foreground"
                          >
                            Ngày bắt đầu nghỉ{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="endDate"
                            className="text-sm font-medium text-foreground"
                          >
                            Ngày kết thúc nghỉ{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="reason"
                          className="text-sm font-medium text-foreground"
                        >
                          Lý do xin nghỉ{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Nhập lý do xin nghỉ..."
                          className="min-h-[100px] border resize-none"
                        />
                      </div>

                      {/* <div className="space-y-2">
                        <Label
                          htmlFor="image"
                          className="text-sm font-medium text-foreground"
                        >
                          Tệp đính kèm (nên bỏ đi)
                        </Label>
                        <div className="space-y-3">
                          {!image ? (
                            <label
                              htmlFor="image"
                              className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-accent transition-colors"
                            >
                              <Upload className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Chọn tệp để tải lên
                              </span>
                              <Input
                                id="image"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                              />
                            </label>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-primary" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {image.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {(image.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={removeAttachment}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              {imagePreview && (
                                <div className="relative rounded-lg border">
                                  <img
                                    src={
                                      imagePreview || '/placeholder.svg'
                                    }
                                    alt="Preview"
                                    className="w-full h-auto max-h-64 object-contain bg-muted"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div> */}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => resetForm()}
                        className="flex-1 h-12 text-base bg-transparent"
                      >
                        Hủy bỏ
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold shadow-lg"
                      >
                        {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</span> : 'Gửi đơn'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Affected Sessions Section - 1/2 width */}
            <div>
              <Card className="shadow-xl border rounded-2xl sticky top-6">
                <CardHeader className="bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground pb-6 rounded-t-2xl">
                  <CardTitle className="text-xl font-bold">
                    Buổi học bị ảnh hưởng
                  </CardTitle>
                  <CardDescription className="text-secondary-foreground/80 text-sm">
                    {affectedSessions.length > 0
                      ? `${affectedSessions.length} buổi học trong khoảng thời gian nghỉ`
                      : 'Chọn ngày nghỉ để xem các buổi học bị ảnh hưởng'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  {isAffectedSessionsLoading ? (
                    <Loading />
                  ) : affectedSessions.length > 0 ? (
                    <div className="space-y-4">
                      <AffectedSessionsTable
                        sessions={affectedSessions}
                        setSessions={setAffectedSessions}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Chọn ngày bắt đầu và kết thúc nghỉ để xem các buổi học
                        bị ảnh hưởng
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSubmit}
      />
    </>
  );
}
