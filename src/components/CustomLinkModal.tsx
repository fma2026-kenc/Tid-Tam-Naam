import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Globe, Link2, Building, Tag, FileText, BookmarkCheck } from 'lucide-react';
import { LinkItem, TabId } from '../types';
import { SECTIONS } from '../data/defaultLinks';

interface CustomLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Omit<LinkItem, 'id'> & { id?: string }) => void;
  defaultSection: TabId;
  editingLink?: LinkItem | null;
}

export const CustomLinkModal: React.FC<CustomLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultSection,
  editingLink,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [agency, setAgency] = useState('');
  const [section, setSection] = useState<TabId>(defaultSection);
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLink) {
      setUrl(editingLink.url);
      setTitle(editingLink.title);
      setAgency(editingLink.agency || '');
      setSection(editingLink.section);
      setDescription(editingLink.description || '');
      setTagInput(editingLink.tags ? editingLink.tags.join(', ') : '');
      setIsDefault(Boolean(editingLink.isDefault));
    } else {
      setUrl('');
      setTitle('');
      setAgency('');
      setSection(defaultSection);
      setDescription('');
      setTagInput('');
      setIsDefault(false);
    }
    setError('');
  }, [editingLink, defaultSection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic URL validation
    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('กรุณาระบุ URL ของเว็บไซต์');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError('รูปแบบ URL ไม่ถูกต้อง (ตัวอย่าง: https://example.com)');
      return;
    }

    if (!title.trim()) {
      setError('กรุณาระบุชื่อลิงค์หรือชื่อจุดตรวจวัด');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: editingLink?.id,
      url: cleanUrl,
      title: title.trim(),
      agency: agency.trim() || 'ลิงค์ส่วนบุคคล',
      section,
      description: description.trim(),
      tags: tags.length > 0 ? tags : ['ลิงค์ส่วนตัว'],
      isDefault,
      isCustom: true,
      iframeSafe: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl md:rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#0077B6] flex items-center justify-center font-bold">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingLink ? 'แก้ไขลิงค์ส่วนตัว' : 'สร้างลิงค์ส่วนตัว (Custom Link)'}
              </h3>
              <p className="text-xs text-slate-500">
                เพิ่มลิงค์เว็บไซต์ จุดตรวจวัดน้ำ หรือกล้อง CCTV ที่คุณต้องการติดตาม
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Section Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่ที่ต้องการบรรจุลิงค์
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SECTIONS.map((sec) => (
                <button
                  type="button"
                  key={sec.id}
                  onClick={() => setSection(sec.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all min-h-[48px] flex flex-col justify-center ${
                    section === sec.id
                      ? 'border-[#0077B6] bg-sky-50/80 font-semibold text-[#0077B6]'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{sec.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL เว็บไซต์เป้าหมาย <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://thaiwater.net หรือลิงค์กล้อง CCTV"
                className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
                required
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อลิงค์ / จุดตรวจวัด <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น กล้องประตูระบายน้ำคลองแสนแสบ หรือ สถานีวัดน้ำชุมชน"
              className="w-full px-3 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
              required
            />
          </div>

          {/* Agency / Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หน่วยงาน / ชุมชน / แหล่งที่มา
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="เช่น เทศบาลตำบล, ชุมชนริมน้ำ, อบต. หรือกล้องเอกชน"
                className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ข้อมูลสำคัญ เช่น ระดับวิกฤตอยู่ที่ 2.50 ม. หรือเบอร์ติดต่อเจ้าหน้าที่เฝ้าระวัง"
              rows={2}
              className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แท็กค้นหา (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="เช่น ชลประทาน, กล้องสด, คลองเปรม"
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
              />
            </div>
          </div>

          {/* Set as Default Checkbox */}
          <label className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300"
            />
            <div className="text-xs">
              <p className="font-semibold text-emerald-950">
                ตั้งเป็นหน้าเริ่มต้นของหมวดนี้ทันที (Default Entry Page)
              </p>
              <p className="text-emerald-700 text-[11px]">
                เมื่อคุณเปิดหมวดนี้ ระบบจะแสดงหน้าเว็บนี้เป็นอันดับแรกเสมอ
              </p>
            </div>
          </label>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs md:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs md:text-sm font-bold bg-[#0077B6] hover:bg-[#0284C7] text-white rounded-xl shadow-md shadow-[#0077B6]/20 transition-all min-h-[44px] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingLink ? 'บันทึกการแก้ไข' : 'เพิ่มลิงค์ส่วนตัว'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
