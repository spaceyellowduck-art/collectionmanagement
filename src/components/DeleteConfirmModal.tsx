import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DeleteConfirmModal: React.FC = () => {
  const {
    isDeleteDialogOpen,
    itemToDelete,
    closeDeleteDialog,
    confirmDeleteItem,
    t,
  } = useApp();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!isDeleteDialogOpen || !itemToDelete) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await confirmDeleteItem();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeDeleteDialog}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Dialog Container */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] p-6 shadow-2xl animate-scaleUp">
        {/* Warning Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF1F1] dark:bg-[#382020] text-[#BA3D3D] dark:text-[#E05353] mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="font-serif-tc text-lg font-bold text-[#2A2521] dark:text-[#EDE6DE]">
            {t('deleteConfirmTitle')}
          </h3>
          <p className="mt-2 font-serif-tc text-xs leading-relaxed text-[#7E746A] dark:text-[#A3978B]">
            {t('deleteConfirmDesc', { name: itemToDelete.name })}
          </p>

          <div className="mt-4 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#221F1C] p-3 text-left">
            <span className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block truncate">
              {itemToDelete.name}
            </span>
            <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] block">
              分類：{itemToDelete.category} · 數量：{itemToDelete.quantity || 1} 件
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={closeDeleteDialog}
            className="flex-1 rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#1C1A17] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] py-2.5 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] transition-colors"
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#BA3D3D] hover:bg-[#9E2B2B] dark:bg-[#E05353] dark:hover:bg-[#C64141] py-2.5 font-serif-tc text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? '刪除中...' : t('confirmDelete')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
