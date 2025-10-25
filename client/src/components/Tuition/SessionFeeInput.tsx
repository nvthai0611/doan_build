import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { SessionFeeInputProps } from '../../types/tuition.types';

export function SessionFeeInput({ 
  gradeId, 
  subjectId, 
  currentFee, 
  onFeeChange, 
  isLoading = false 
}: SessionFeeInputProps) {
  const [fee, setFee] = useState<number>(currentFee || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (fee < 0) {
      return;
    }

    try {
      setIsSaving(true);
      await onFeeChange(gradeId, subjectId, fee);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving fee:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFee(currentFee || 0);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          onKeyDown={handleKeyPress}
          className="w-24 text-sm"
          placeholder="0"
          disabled={isSaving}
          min="0"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || fee < 0}
          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-8"
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-2 py-1 h-8"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium min-w-[80px]">
        {currentFee ? `${currentFee.toLocaleString()} VND` : 'Chưa cấu hình'}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        disabled={isLoading}
        className="text-gray-500 hover:text-gray-700 p-1 h-6 w-6"
      >
        <Edit2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
