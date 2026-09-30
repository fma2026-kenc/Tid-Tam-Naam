import React, { useState } from 'react';
import {
  X,
  Trash2,
  Edit3,
  BookmarkCheck,
  Plus,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Star,
  Globe,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { LinkItem, TabId } from '../types';
import { SECTIONS } from '../data/defaultLinks';

interface ManageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabId;
  links: LinkItem[];
  defaultUrl: string;
  hasHiddenLinks: boolean;
  onSelectLink: (link: LinkItem) => void;
  onRequestDelete: (link: LinkItem) => void;
  onEditCustomLink: (link: LinkItem) => void;
  onSetDefault: (section: TabId, url: string) => void;
  onOpenAddModal: (section: TabId) => void;
  onRestoreAllHidden: () => void;
  onReorderLinks?: (section: TabId, reorderedIds: string[]) => void;
}

export const ManageLinksModal: React.FC<ManageLinksModalProps> = ({
  isOpen,
  onClose,
  currentTab,
  links,
  defaultUrl,
  hasHiddenLinks,
  onSelectLink,
  onRequestDelete,
  onEditCustomLink,
  onSetDefault,
  onOpenAddModal,
  onRestoreAllHidden,
  onReorderLinks,
}) => {
  const [filter, setFilter] = useState<'all' | 'custom' | 'official'>('all');

  if (!isOpen) return null;

  const currentSection = SECTIONS.find((s) => s.id === currentTab) || SECTIONS[0];
  const filtered = links.filter((l) => {
    if (filter === 'custom') return !!l.isCustom;
    if (filter === 'official') return !l.isCustom;
    return true;
  });

  const handleNudge = (index: number, direction: 'up' | 'down') => {
    if (!onReorderLinks) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filtered.length) return;

    const reordered = [...filtered];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const reorderedIds = reordered.map((l) => l.id);
    const remainingIds = links
      .filter((l) => !reorderedIds.includes(l.id))
      .map((l) => l.id);

    onReorderLinks(currentTab, [...reorderedIds, ...remainingIds]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>จัดการลิงค์ในหมวด: {currentSection.shortName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                {links.length} ลิงค์
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              ลบ แก้ไข หรือเลือกตั้งเป็นหน้าเริ่มต้นสำหรับหมวดนี้
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap bg-white">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({links.length})
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                filter === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ส่วนตัว ({links.filter((l) => l.isCustom).length})
            </button>
            <button
              onClick={() => setFilter('official')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
                filter === 'official'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทางการ ({links.filter((l) => !l.isCustom).length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasHiddenLinks && (
              <button
                onClick={onRestoreAllHidden}
                className="text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-semibold transition-colors min-h-[32px]"
                title="นำลิงค์ทางการที่ถูกซ่อนกลับมาแสดงทั้งหมด"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>กู้คืนลิงค์</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenAddModal(currentTab);
              }}
              className="text-xs text-white bg-[#0077B6] hover:bg-[#0284C7] px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold shadow-xs transition-colors min-h-[32px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มลิงค์ใหม่</span>
            </button>
          </div>
        </div>

        {/* Links List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.map((link, index) => {
            const isDefault = defaultUrl === link.url;

            return (
              <div
                key={link.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDefault
                    ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Up / Down Nudge Buttons */}
                  {onReorderLinks && (
                    <div className="flex flex-col items-center justify-center shrink-0 text-slate-400 pt-0.5">
                      <button
                        onClick={() => handleNudge(index, 'up')}
                        disabled={index === 0}
                        className={`p-0.5 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-800 transition-colors ${
                          index === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-80'
                        }`}
                        title="เลื่อนขึ้น"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                      <button
                        onClick={() => handleNudge(index, 'down')}
                        disabled={index === filtered.length - 1}
                        className={`p-0.5 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-800 transition-colors ${
                          index === filtered.length - 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-80'
                        }`}
                        title="เลื่อนลง"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      onSelectLink(link);
                      onClose();
                    }}
                  >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs md:text-sm text-slate-900">
                      {link.title}
                    </span>
                    {link.isCustom ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                        ลิงค์ส่วนตัว
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                        ทางการ
                      </span>
                    )}

                    {isDefault && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                        หน้าเริ่มต้นปัจจุบัน
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5">{link.agency}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{link.url}</p>
                </div>
              </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {!isDefault ? (
                    <button
                      onClick={() => onSetDefault(currentTab, link.url)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#0077B6] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors min-h-[36px]"
                    >
                      ตั้งเป็นหน้าหลัก
                    </button>
                  ) : null}

                  {link.isCustom && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditCustomLink(link);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="แก้ไขลิงค์"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete button (For both custom and official links) */}
                  <button
                    onClick={() => onRequestDelete(link)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="ลบหรือซ่อนการ์ดนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">ไม่มีลิงค์ในตัวกรองนี้</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors min-h-[40px]"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
