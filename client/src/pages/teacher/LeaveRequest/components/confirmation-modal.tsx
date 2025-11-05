'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="max-w-md w-full shadow-2xl border-2 border-blue-600">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
            Xác Nhận Gửi Đơn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <p className="text-gray-700 dark:text-gray-300">
            Bạn có chắc chắn muốn gửi đơn xin nghỉ phép này không?
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Xác Nhận
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
