import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  BookmarkCheck,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Tag,
  RotateCcw,
  SlidersHorizontal,
  GripVertical,
  MoveVertical,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { LinkItem, TabId } from '../types';
import { SECTIONS } from '../data/defaultLinks';

interface TabletSidebarProps {
  currentTab: TabId;
  allLinks: LinkItem[];
  activeLink: LinkItem | null;
  defaultUrl: string;
  hasHiddenLinks: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLink: (link: LinkItem) => void;
  onOpenAddModal: (section?: TabId) => void;
  onOpenManageModal: () => void;
  onEditCustomLink: (link: LinkItem) => void;
  onRequestDeleteLink: (link: LinkItem) => void;
  onSetDefault: (section: TabId, url: string) => void;
  onRestoreAllHidden: () => void;
  onReorderLinks: (section: TabId, reorderedIds: string[]) => void;
  onSwitchToViewer?: () => void;
}

export const TabletSidebar: React.FC<TabletSidebarProps> = ({
  currentTab,
  allLinks,
  activeLink,
  defaultUrl,
  hasHiddenLinks,
  isCollapsed,
  onToggleCollapse,
  onSelectLink,
  onOpenAddModal,
  onOpenManageModal,
  onEditCustomLink,
  onRequestDeleteLink,
  onSetDefault,
  onRestoreAllHidden,
  onReorderLinks,
  onSwitchToViewer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'official' | 'custom'>('all');

  // Drag and drop & long press states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);

  const currentSection = SECTIONS.find((s) => s.id === currentTab) || SECTIONS[0];

  // Current links for this section (already ordered by App.tsx with default at top)
  const sectionLinks = allLinks.filter((l) => l.section === currentTab);

  // Filter links for search & category
  const filteredLinks = sectionLinks.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'official') return !l.isCustom;
    if (filterType === 'custom') return !!l.isCustom;
    return true;
  });

  const officialCount = sectionLinks.filter((l) => !l.isCustom).length;
  const customCount = sectionLinks.filter((l) => l.isCustom).length;

  // Move item in order
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= filteredLinks.length || toIndex >= filteredLinks.length) return;

    const reorderedFiltered = [...filteredLinks];
    const [movedLink] = reorderedFiltered.splice(fromIndex, 1);
    reorderedFiltered.splice(toIndex, 0, movedLink);

    // Reconstruct full section list maintaining any items not currently displayed
    const reorderedIds = reorderedFiltered.map((l) => l.id);
    const remainingIds = sectionLinks
      .filter((l) => !reorderedIds.includes(l.id))
      .map((l) => l.id);

    onReorderLinks(currentTab, [...reorderedIds, ...remainingIds]);
  };

  // Up / Down arrow click handlers
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index > 0) {
      moveItem(index, index - 1);
    }
  };

  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index < filteredLinks.length - 1) {
      moveItem(index, index + 1);
    }
  };

  // Pointer event handlers for Long Press & Drag
  const handlePointerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't trigger long press if user clicked on a button, link, or input
    if (target.closest('button, a, input, select, textarea')) {
      return;
    }

    pointerStartPos.current = { x: e.clientX, y: e.clientY };

    // 250ms long press timer
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(true);
      setDraggedIndex(index);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch (_) {}
      }
    }, 250);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartPos.current) {
      const dist = Math.hypot(
        e.clientX - pointerStartPos.current.x,
        e.clientY - pointerStartPos.current.y
      );
      // If user moved more than 10px before long-press fires, they are scrolling normally
      if (dist > 10 && !isHolding) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
      }
    }

    // If currently holding and dragging
    if (isHolding && draggedIndex !== null) {
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const cardElem = elem?.closest('[data-card-index]') as HTMLElement | null;
      if (cardElem) {
        const overIndex = parseInt(cardElem.dataset.cardIndex || '-1', 10);
        if (overIndex >= 0 && overIndex !== draggedIndex && overIndex < filteredLinks.length) {
          moveItem(draggedIndex, overIndex);
          setDraggedIndex(overIndex);
          if ('vibrate' in navigator) {
            try {
              navigator.vibrate(20);
            } catch (_) {}
          }
        }
      }
    }
  };

  const handlePointerUpOrCancel = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    setDraggedIndex(null);
    pointerStartPos.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  // HTML5 Drag and Drop Handlers for Desktop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      moveItem(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setIsHolding(false);
  };

  if (isCollapsed) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 w-14 bg-white border-r border-slate-200 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="ขยายแถบเมนูรายการลิงค์"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="mt-4 flex flex-col gap-3">
          {sectionLinks.slice(0, 6).map((link) => {
            const isSelected = activeLink?.url === link.url;
            return (
              <button
                key={link.id}
                onClick={() => onSelectLink(link)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#0077B6] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={link.title}
              >
                {link.title.charAt(0)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      className="w-full md:w-80 lg:w-96 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden transition-all duration-200 select-none"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0077B6]" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {currentSection.title}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {onSwitchToViewer && (
              <button
                type="button"
                onClick={onSwitchToViewer}
                className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 text-[#0077B6] font-bold text-xs border border-sky-100 min-h-[36px]"
                title="สลับไปดูหน้าเว็บ"
              >
                <span>ดูหน้าเว็บ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onOpenManageModal}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="จัดการลิงค์ในหมวดนี้"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] items-center justify-center"
              title="ย่อแถบเมนู"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">{currentSection.subtitle}</p>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาแหล่งข้อมูล / หน่วยงาน..."
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6] transition-all"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 mt-2.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({sectionLinks.length})
          </button>
          <button
            onClick={() => setFilterType('official')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
              filterType === 'official'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทางการ ({officialCount})
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors min-h-[32px] ${
              filterType === 'custom'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ส่วนตัว ({customCount})
          </button>
        </div>

        {/* Reorder Hint Banner */}
        <div className="mt-2.5 px-2.5 py-1.5 bg-sky-50/80 rounded-xl border border-sky-100/90 flex items-center justify-between text-[11px] text-sky-800">
          <div className="flex items-center gap-1.5 truncate">
            <MoveVertical className="w-3.5 h-3.5 text-[#0077B6] shrink-0" />
            <span className="truncate">กดค้างที่การ์ดเพื่อเลื่อนสลับลำดับ</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded font-semibold shrink-0">
            หน้าหลักอยู่บนสุด
          </span>
        </div>

        {/* Restore hidden links button if any */}
        {hasHiddenLinks && (
          <button
            onClick={onRestoreAllHidden}
            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>กู้คืนลิงค์ทางการที่ถูกซ่อนทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Active dragging indicator toast if user is dragging */}
      {isHolding && draggedIndex !== null && (
        <div className="bg-[#0077B6] text-white px-3 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2 animate-pulse shrink-0">
          <GripVertical className="w-4 h-4" />
          <span>กำลังเลื่อนสลับตำแหน่ง: ลากขึ้น/ลง แล้วปล่อยเพื่อวาง</span>
        </div>
      )}

      {/* Unified Reorderable Links List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredLinks.map((link, index) => {
          const isSelected = activeLink?.url === link.url;
          const isDefault = defaultUrl === link.url;
          const isBeingDragged = draggedIndex === index;

          return (
            <div
              key={link.id}
              data-card-index={index}
              onClick={() => onSelectLink(link)}
              className={`group relative p-3 rounded-2xl border transition-all duration-150 cursor-pointer ${
                isBeingDragged
                  ? 'border-[#0077B6] bg-sky-100/90 shadow-2xl scale-[1.02] ring-2 ring-[#0077B6]/40 z-30 opacity-95'
                  : isSelected
                  ? 'border-[#0077B6] bg-sky-50/70 shadow-xs'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              } ${isDefault ? 'ring-1 ring-emerald-500/20' : ''}`}
            >
              {/* Card Main Row */}
              <div className="flex items-start gap-2">
                {/* Drag Grip Handle & Quick Up/Down Nudge Chevrons */}
                <div
                  className="flex flex-col items-center justify-center shrink-0 pt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors"
                  title="กดค้างเพื่อเลื่อนสลับตำแหน่ง หรือใช้ปุ่มลูกศร"
                >
                  <button
                    type="button"
                    onClick={(e) => handleMoveUp(index, e)}
                    disabled={index === 0}
                    className={`p-0.5 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-800 transition-colors ${
                      index === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-80'
                    }`}
                    title="เลื่อนขึ้น 1 ตำแหน่ง"
                    aria-label="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <div
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onPointerDown={(e) => handlePointerDown(index, e)}
                    className="py-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#0077B6] touch-none"
                    title="กดค้างเพื่อเลื่อนสลับตำแหน่ง"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleMoveDown(index, e)}
                    disabled={index === filteredLinks.length - 1}
                    className={`p-0.5 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-800 transition-colors ${
                      index === filteredLinks.length - 1 ? 'opacity-20 cursor-not-allowed' : 'opacity-80'
                    }`}
                    title="เลื่อนลง 1 ตำแหน่ง"
                    aria-label="Move Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-snug">
                      {link.title}
                    </h3>

                    {/* Default Pill (Always at Top) */}
                    {isDefault && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/80 shadow-2xs">
                        <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                        หน้าหลัก (บนสุด)
                      </span>
                    )}

                    {/* Custom or Official Badge */}
                    {link.isCustom ? (
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-md border border-purple-100">
                        ส่วนตัว
                      </span>
                    ) : (
                      link.badge && (
                        <span className="text-[10px] text-sky-800 bg-sky-100/80 px-1.5 py-0.2 rounded-md font-medium">
                          {link.badge}
                        </span>
                      )
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1 truncate">
                    <span>{link.agency}</span>
                  </p>

                  {link.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {link.description}
                    </p>
                  )}

                  {/* Explicit Open/View Button */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLink(link);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#0077B6] text-white shadow-xs'
                          : 'bg-sky-50/90 hover:bg-sky-100 text-[#0077B6] border border-sky-200/70'
                      }`}
                    >
                      <span>{isSelected ? 'เปิดดูอยู่ขณะนี้' : 'เปิดดูหน้านี้'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
                      title="เปิดในแท็บเบราว์เซอร์ใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Card Right Actions (Edit, External Link, Delete) */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {link.isCustom ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCustomLink(link);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 min-h-[30px] min-w-[30px] flex items-center justify-center"
                        title="แก้ไขลิงค์ส่วนตัว"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestDeleteLink(link);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50 min-h-[30px] min-w-[30px] flex items-center justify-center"
                        title="ลบหรือซ่อนการ์ดนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 min-h-[30px] min-w-[30px] flex items-center justify-center"
                        title="เปิดในแท็บใหม่"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestDeleteLink(link);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-md hover:bg-rose-50 min-h-[30px] min-w-[30px] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                        title="ลบหรือซ่อนการ์ดนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer: Tags & Set As Default Button */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[170px]">
                  {link.tags?.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-0.5 truncate">
                      <Tag className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{tag}</span>
                    </span>
                  ))}
                </div>

                {!isDefault ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetDefault(currentTab, link.url);
                    }}
                    className="text-[#0077B6] hover:text-[#0284C7] hover:underline font-bold flex items-center gap-1 ml-auto transition-colors"
                    title="ตั้งเป็นการ์ดเริ่มต้นและเลื่อนไปอยู่บนสุด"
                  >
                    <Star className="w-3 h-3 text-[#0077B6]" />
                    <span>ตั้งเป็นหน้าเริ่มต้น</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-semibold ml-auto flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    เปิดเป็นค่าเริ่มต้น
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty Search Result State */}
        {filteredLinks.length === 0 && (
          <div className="text-center py-8 px-4 text-slate-400">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">ไม่พบแหล่งข้อมูลที่ตรงกับคำค้นหา</p>
            <button
              onClick={() => onOpenAddModal(currentTab)}
              className="mt-3 text-xs text-[#0077B6] font-semibold hover:underline"
            >
              + เพิ่มเป็นลิงค์ส่วนตัว
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer Action */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
        <button
          onClick={() => onOpenAddModal(currentTab)}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#0077B6]/40 hover:border-[#0077B6] text-[#0077B6] hover:bg-sky-50/60 text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างลิงค์ส่วนตัวในหมวดนี้</span>
        </button>
      </div>
    </aside>
  );
};
