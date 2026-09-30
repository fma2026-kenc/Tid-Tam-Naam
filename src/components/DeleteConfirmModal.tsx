import React, { useState, useEffect } from 'react';
import { Trash2, EyeOff, AlertTriangle, X, Check, ShieldCheck, Star } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  linkTitle: string;
  linkAgency?: string;
  linkUrl?: string;
  isCustom?: boolean;
  onConfirm: (mode: 'hide' | 'permanent') => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  linkTitle,
  linkAgency,
  linkUrl,
  isCustom = false,
  onConfirm,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<'hide' | 'permanent'>('hide');

  // Reset to default 'hide' mode each time modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMode('hide');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecute = () => {
    onConfirm(selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                selectedMode === 'permanent'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-sky-100 text-[#0077B6]'
              }`}
            >
              {selectedMode === 'permanent' ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                จัดการการ์ดลิงค์
              </h3>
              <p className="text-xs text-slate-500">เลือกรูปแบบ: ซ่อน หรือ ลบถาวร</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Target Info Card */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                {linkTitle}
              </span>
              {isCustom ? (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-purple-600 text-purple-600" />
                  ส่วนตัว
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                  ทางการ
                </span>
              )}
            </div>
            {linkAgency && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{linkAgency}</p>
            )}
            {linkUrl && (
              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{linkUrl}</p>
            )}
          </div>

          {/* Selection Options: Hide vs Permanently Delete */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-slate-700">กรุณาเลือกการดำเนินการ:</p>

            {/* Option 1: ซ่อน (Hide) */}
            <div
              onClick={() => setSelectedMode('hide')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedMode === 'hide'
                  ? 'border-[#0077B6] bg-sky-50/70 shadow-sm ring-1 ring-[#0077B6]/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedMode === 'hide'
                    ? 'bg-[#0077B6] text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <EyeOff className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs md:text-sm font-bold text-slate-900">
                    ซ่อนการ์ดนี้
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                    แนะนำ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  นำการ์ดออกจากหน้าจอชั่วคราว ข้อมูลจะไม่หาย และสามารถกดปุ่ม{' '}
                  <strong className="text-slate-700">"กู้คืนลิงค์ที่ซ่อน"</strong>{' '}
                  เพื่อนำกลับมาแสดงใหม่ได้ตลอดเวลา
                </p>
              </div>
            </div>

            {/* Option 2: ลบถาวร (Permanently Delete) */}
            <div
              onClick={() => setSelectedMode('permanent')}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                selectedMode === 'permanent'
                  ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-1 ring-rose-500/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedMode === 'permanent'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs md:text-sm font-bold text-rose-950">
                    ลบการ์ดนี้ถาวร
                  </h4>
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-md">
                    ลบถาวร
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {isCustom
                    ? 'ลบข้อมูลลิงค์ส่วนตัวนี้ออกจากเครื่องของคุณอย่างถาวร ไม่สามารถกู้คืนได้'
                    : 'ลบลิงค์นี้ออกจากระบบอย่างถาวร จะไม่กลับมาแสดงแม้จะกดปุ่มกู้คืนลิงค์ที่ซ่อน'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px]"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleExecute}
            className={`py-2.5 px-5 text-xs md:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 min-h-[44px] flex items-center gap-1.5 ${
              selectedMode === 'permanent'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                : 'bg-[#0077B6] hover:bg-[#0284C7] text-white shadow-[#0077B6]/25'
            }`}
          >
            {selectedMode === 'permanent' ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันลบถาวร</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>ซ่อนการ์ดนี้</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
