'use client';
import { useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  Zap,
  Database,
  Mail,
  RefreshCw,
  BarChart3,
  Settings,
  Clock,
  AlertCircle,
  X,
  Link,
  NotebookPen,
  NotebookText,
} from 'lucide-react';
import { Button } from '@/assets/shadcn-ui/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllType,
  triggerCronJob,
} from '../../../../services/center-owner/trigger-cronjobs/trigger-management.service';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/assets/shadcn-ui/components/ui/breadcrumb';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ManualTriggerPanelProps {
  availableJobTypes?: string[];
}

// Card Components
function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>;
}

function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h3>
  );
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-0">{children}</div>;
}

// Toast Component
function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
          type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Map job types to icons and colors
const jobTypeConfig: Record<string, any> = {
  backup_database: {
    icon: Database,
    label: 'Database Backup',
    description: 'Backup your database',
    color:
      'from-blue-500/20 to-blue-500/5 hover:from-blue-500/30 hover:to-blue-500/10 border-blue-500/30',
  },
  sync_cache: {
    icon: RefreshCw,
    label: 'Sync Cache',
    description: 'Refresh cached data',
    color:
      'from-purple-500/20 to-purple-500/5 hover:from-purple-500/30 hover:to-purple-500/10 border-purple-500/30',
  },
  send_emails: {
    icon: Mail,
    label: 'Send Emails',
    description: 'Process email queue',
    color:
      'from-pink-500/20 to-pink-500/5 hover:from-pink-500/30 hover:to-pink-500/10 border-pink-500/30',
  },
  generate_reports: {
    icon: BarChart3,
    label: 'Generate Reports',
    description: 'Create analytics reports',
    color:
      'from-green-500/20 to-green-500/5 hover:from-green-500/30 hover:to-green-500/10 border-green-500/30',
  },
  cleanup_temp: {
    icon: Settings,
    label: 'Cleanup Temp',
    description: 'Remove temporary files',
    color:
      'from-orange-500/20 to-orange-500/5 hover:from-orange-500/30 hover:to-orange-500/10 border-orange-500/30',
  },
  process_payments: {
    icon: Zap,
    label: 'Process Payments',
    description: 'Handle payment processing',
    color:
      'from-amber-500/20 to-amber-500/5 hover:from-amber-500/30 hover:to-amber-500/10 border-amber-500/30',
  },
  teacher_payroll_generation: {
    icon: NotebookPen,
    label: 'Tạo bảng lương giáo viên',
    description: 'Tính toán và tạo bảng lương',
    color:
      'from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30 hover:to-emerald-500/10 border-emerald-500/30',
  },
  bill_generation: {
    icon: NotebookText,
    label: 'Tạo hóa đơn cho học sinh',
    description: 'Tạo hóa đơn tự động',
    color:
      'from-cyan-500/20 to-cyan-500/5 hover:from-cyan-500/30 hover:to-cyan-500/10 border-cyan-500/30',
  },
  fee_reminder_early: {
    icon: Mail,
    label: 'Gửi email thông báo hóa đơn cho phụ huynh',
    description: 'Gửi hóa đơn qua email',
    color:
      'from-indigo-500/20 to-indigo-500/5 hover:from-indigo-500/30 hover:to-indigo-500/10 border-indigo-500/30',
  },
  fee_reminder_due: {
    icon: Mail,
    label: 'Gửi email nhắc hạn đóng học phí cho phụ huynh',
    description: 'Nhắc hạn đóng học phí qua email',
    color:
      'from-purple-500/20 to-purple-500/5 hover:from-purple-500/30 hover:to-purple-500/10 border-purple-500/30',
  },
};

// Custom Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  jobType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobType: string | null;
}) {
  if (!isOpen || !jobType) return null;

  const config = jobTypeConfig[jobType];
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mx-4">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Xác nhận kích hoạt</h2>
                <p className="text-sm text-white/80 mt-1">
                  Nhiệm vụ sẽ được thực thi ngay lập tức
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${
                    config.color.split(' ')[0]
                  } ${config.color.split(' ')[1]}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {config.label}
                  </h3>
                  {config.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {config.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <p>
                Quá trình này có thể mất vài giây. Bạn có thể tiếp tục làm việc
                trong khi nhiệm vụ đang chạy.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Xác nhận kích hoạt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ManualTriggerPanel({
  availableJobTypes = [],
}: ManualTriggerPanelProps) {
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const [lastTriggeredJob, setLastTriggeredJob] = useState<{
    type: string;
    timestamp: Date;
  } | null>(null);
  const [pendingJob, setPendingJob] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Fetch job types from API
  const {
    data: jobTypesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['fetchJobTypes'],
    queryFn: async () => {
      const response = await getAllType();
      return response;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map API data với UI config
  const displayJobs = jobTypesData
    ?.filter((job: any) => jobTypeConfig[job.jobType]) // Chỉ hiển thị jobs có config UI
    ?.map((job: any) => ({
      type: job.jobType,
      ...jobTypeConfig[job.jobType],
      lastExecution: {
        status: job.status,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      },
    }));

  // const showToast = (message: string, type: "success" | "error" = "success") => {
  //   setToast({ message, type })
  // }

  const handleTriggerJobClick = (jobType: string) => {
    setPendingJob(jobType);
    setShowConfirmDialog(true);
  };

  const handleConfirmTrigger = async () => {
    if (!pendingJob) return;

    setShowConfirmDialog(false);
    setTriggeringJob(pendingJob);
    const config = jobTypeConfig[pendingJob];
    try {
      const response = await triggerCronJob(pendingJob, config.label);
      await new Promise((res) => setTimeout(res, 1000)); // Simulate delay
      await queryClient.invalidateQueries({
        queryKey: ['fetchJobTypes'],
        refetchType: 'active', // OPTIONAL
      });
      setLastTriggeredJob({
        type: pendingJob,
        timestamp: new Date(),
      });

      toast.success(`${config.label} đã được kích hoạt thành công.`);
    } catch (error) {
      toast.error('Không thể kích hoạt nhiệm vụ. Vui lòng thử lại.');
    } finally {
      setTriggeringJob(null);
      setPendingJob(null);
    }
  };

  const handleCancelTrigger = () => {
    setShowConfirmDialog(false);
    setPendingJob(null);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Quản lý nhiệm vụ thực thi
              </h1>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="cursor-pointer"
                      onClick={() => navigate('/center-qn/trigger-cronjobs')}
                    >
                      Quản lý công việc{' '}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Kích hoạt thủ công</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <p className="mt-2 text-sm text-muted-foreground">
                Giám sát và quản lý các lần thực thi công việc đã lên lịch (Mặc
                định: Tháng trước)
              </p>
            </div>
            <Link to="manual-trigger">
              <Button
                variant="default"
                className="bg-gradient-to-r bg-red-600 from-accent to-accent-600 text-white hover:from-accent-600 hover:to-accent-700"
              >
                Kích hoạt thủ công
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Kích hoạt Nhiệm vụ Nhanh
          </CardTitle>
          <CardDescription>
            Nhấn để chạy các công việc hệ thống ngay lập tức
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="ml-2 text-sm text-gray-500">
                Đang tải danh sách nhiệm vụ hệ thống ...
              </p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <p className="ml-2 text-sm text-red-600">
                Không thể tải danh sách nhiệm vụ hệ thống
              </p>
            </div>
          ) : displayJobs?.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">
                Không có nhiệm vụ hệ thống nào khả dụng{' '}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayJobs?.map((job: any) => {
                  const IconComponent = job.icon;
                  const isTriggering = triggeringJob === job.type;
                  const isLastTriggered = lastTriggeredJob?.type === job.type;

                  return (
                    <button
                      key={job.type}
                      onClick={() => handleTriggerJobClick(job.type)}
                      disabled={triggeringJob !== null}
                      className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-300 bg-gradient-to-br ${job.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="relative">
                        {isTriggering ? (
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        ) : isLastTriggered ? (
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        ) : (
                          <IconComponent className="h-8 w-8 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {job.label}
                        </p>
                        {job.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {job.description}
                          </p>
                        )}
                        {/* Hiển thị trạng thái lần chạy gần nhất */}
                        {job.lastExecution?.status && (
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                job.lastExecution.status === 'success'
                                  ? 'bg-green-500'
                                  : job.lastExecution.status === 'failed'
                                  ? 'bg-red-500'
                                  : job.lastExecution.status === 'running'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-500'
                              }`}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {job.lastExecution.status === 'success'
                                ? `Thành công lúc ${formatDate(
                                    job.lastExecution.completedAt,
                                  )}`
                                : job.lastExecution.status === 'failed'
                                ? `Thất bại lúc ${formatDate(
                                    job.lastExecution.completedAt,
                                  )}`
                                : job.lastExecution.status === 'running'
                                ? `Đang chạy (bắt đầu lúc ${formatDate(
                                    job.lastExecution.startedAt,
                                  )})`
                                : 'Chưa chạy'}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {lastTriggeredJob && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lần kích hoạt cuối
                  </p>
                  <p className="text-sm font-medium mt-1 text-gray-900 dark:text-white">
                    {jobTypeConfig[lastTriggeredJob.type]?.label ||
                      lastTriggeredJob.type}{' '}
                    •{' '}
                    {new Date(lastTriggeredJob.timestamp).toLocaleTimeString(
                      'vi-VN',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      },
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmDialog}
        onClose={handleCancelTrigger}
        onConfirm={handleConfirmTrigger}
        jobType={pendingJob}
      />

      {/* Toast Notification
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )} */}
    </>
  );
}
