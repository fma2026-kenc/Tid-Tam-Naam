import React, { useState } from 'react';
import {
  PhoneCall,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Zap,
  Car,
  HeartPulse,
  ExternalLink,
  LifeBuoy,
  Search,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/defaultLinks';
import { EmergencyContact } from '../types';

interface EmergencyDirectoryProps {
  onSelectReportLink: (url: string, title: string) => void;
}

export const EmergencyDirectory: React.FC<EmergencyDirectoryProps> = ({ onSelectReportLink }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredContacts = EMERGENCY_CONTACTS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortNumber.includes(searchQuery) ||
      item.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: EmergencyContact['category']) => {
    switch (category) {
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'utility':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'traffic':
        return <Car className="w-5 h-5 text-sky-600" />;
      case 'flood_bma':
        return <LifeBuoy className="w-5 h-5 text-indigo-600" />;
      default:
        return <PhoneCall className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Alert for Emergency */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 p-5 md:p-6 text-white shadow-lg shadow-rose-900/10">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                  สายด่วนนิรภัย ปภ. 24 ชั่วโมง
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                แจ้งเหตุด่วนสาธารณภัย โทร 1784
              </h2>
              <p className="text-xs md:text-sm text-rose-100 max-w-xl leading-relaxed">
                กรมป้องกันและบรรเทาสาธารณภัย กระทรวงมหาดไทย พร้อมรับแจ้งเหตุน้ำท่วมขัง น้ำป่าไหลหลาก
                ดินโคลนถล่ม และประสานงานทีมกู้ภัยอพยพทันที
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <a
                href="tel:1784"
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rose-700 font-bold text-sm md:text-base shadow-lg hover:bg-rose-50 active:scale-95 transition-all min-h-[48px]"
              >
                <PhoneCall className="w-5 h-5 text-rose-600 animate-bounce" />
                <span>โทร 1784 ทันที</span>
              </a>
              <button
                onClick={() =>
                  onSelectReportLink(
                    'https://disaster.go.th/help',
                    'ระบบแจ้งเหตุสาธารณภัยออนไลน์ ปภ.'
                  )
                }
                className="px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs md:text-sm border border-white/20 transition-all min-h-[48px] flex items-center gap-1.5"
              >
                <span>แจ้งพิกัดออนไลน์</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาเบอร์โทร เช่น 1669, ไฟฟ้า, น้ำท่วม กทม., ป่อเต็กตึ๊ง..."
                className="w-full pl-9 pr-3 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077B6]/30 focus:border-[#0077B6]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'hotline', label: 'สายด่วน ปภ.' },
                { id: 'medical', label: 'กู้ชีพ 1669' },
                { id: 'flood_bma', label: 'กทม. 1555' },
                { id: 'utility', label: 'ตัดไฟ/สาธารณูปโภค' },
                { id: 'traffic', label: 'เส้นทางน้ำท่วม' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 rounded-2xl border transition-all bg-white hover:border-slate-300 hover:shadow-sm flex flex-col justify-between ${
                contact.primary ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      {getCategoryIcon(contact.category)}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-900">
                        {contact.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{contact.agency}</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {contact.shortNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {contact.description}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  เวลาทำการ: {contact.available}
                </p>
              </div>

              {/* Call Action Button (48px Touch target) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-400">Tel: {contact.tel}</span>
                <a
                  href={`tel:${contact.tel}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-xs active:scale-95 transition-all min-h-[44px]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>โทรออก {contact.shortNumber}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Flood Safety Protocols & Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              ข้อปฏิบัติสำคัญเมื่อเกิดน้ำท่วมฉับพลันและน้ำหลาก
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">1. สับคัตเอาต์ตัดกระแสไฟฟ้า</p>
                <p className="text-amber-800 text-xs mt-0.5">
                  ปลดเบรกเกอร์ชั้นล่างทันที และห้ามสัมผัสสวิตช์ไฟหรือเครื่องใช้ไฟฟ้าขณะตัวเปียกน้ำ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/60 border border-sky-100">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sky-950">2. ยกของมีค่าและเอกสารขึ้นที่สูง</p>
                <p className="text-sky-800 text-xs mt-0.5">
                  บรรจุบัตรประชาชน ทะเบียนบ้าน โฉนด และยารักษาโรคประจำตัวใส่ถุงพลาสติกกันน้ำ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">3. ห้ามขับรถลุยน้ำที่ไหลเชี่ยว</p>
                <p className="text-rose-800 text-xs mt-0.5">
                  กระแสน้ำสูงเพียง 30 ซม. สามารถพัดพารถยนต์ส่วนบุคคลให้ลอยหรือเสียหลักได้
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-950">4. สังเกตสัตว์มีพิษและเตรียมน้ำดื่ม</p>
                <p className="text-emerald-800 text-xs mt-0.5">
                  งู ตะขาบ แมงป่องมักหนีน้ำขึ้นที่สูง ระวังการเดินในมุมอับ และเตรียมน้ำดื่มสะอาดสำรอง
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
