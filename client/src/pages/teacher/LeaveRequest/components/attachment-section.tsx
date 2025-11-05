'use client';

import type React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface AttachmentSectionProps {
  attachment: File | null;
  setAttachment: (file: File | null) => void;
}

export function AttachmentSection({
  attachment,
  setAttachment,
}: AttachmentSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachment(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    setPreviewUrl(null);
  };

  const isImage = attachment?.type.startsWith('image/');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md">
          5
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Tài Liệu Đính Kèm
        </h2>
      </div>

      <div className="space-y-4 pl-0 md:pl-13">
        <div className="space-y-2">
          <Label htmlFor="attachment" className="text-sm font-medium">
            Tải Lên Minh Chứng
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="attachment"
              type="file"
              onChange={handleFileChange}
              className="h-11"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Upload className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Đính kèm giấy chứng nhận y tế hoặc tài liệu liên quan (nếu có)
          </p>
        </div>

        {attachment && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {isImage ? (
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(attachment.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {isImage && previewUrl && (
              <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <img
                  src={previewUrl || '/placeholder.svg'}
                  alt="Preview"
                  className="w-full h-full object-contain bg-gray-100 dark:bg-gray-900"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
