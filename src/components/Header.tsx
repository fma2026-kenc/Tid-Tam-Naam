import React from 'react';
import { Droplets, Plus, Cloud, PhoneCall } from 'lucide-react';
import { TabId } from '../types';
import { SECTIONS } from '../data/defaultLinks';

interface HeaderProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenAddModal: () => void;
  onOpenDeployModal: () => void;
  onOpenEmergencyQuick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  onOpenDeployModal,
  onOpenEmergencyQuick,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Zone 1: Single text element wordmark with icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0077B6] to-[#0284C7] flex items-center justify-center text-white shadow-sm shadow-[#0077B6]/20">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('water_level');
            }}
            className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 hover:text-[#0077B6] transition-colors"
          >
            <span>Tid-Tam-Naam</span>
            <span className="text-xs md:text-sm font-medium text-[#0077B6] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
              ติดตามน้ำ
            </span>
          </a>
        </div>
      </div>

      {/* Zone 2: Navigation Links for Tablet & Desktop (Hidden on mobile, mobile uses bottom bar) */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
        {SECTIONS.map((section) => {
          const isActive = currentTab === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onTabChange(section.id)}
              className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap min-h-[40px] ${
                isActive
                  ? 'bg-sky-50 text-[#0077B6] font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>{section.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Emergency Hotline Trigger */}
        <button
          onClick={onOpenEmergencyQuick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors min-h-[44px] min-w-[44px]"
          title="สายด่วนฉุกเฉิน ปภ. 1784"
        >
          <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
          <span className="hidden sm:inline">สายด่วน 1784</span>
        </button>

        {/* Custom Link Builder Trigger */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-[#0077B6] text-white hover:bg-[#0284C7] shadow-sm shadow-[#0077B6]/20 transition-all active:scale-[0.98] min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">สร้างลิงค์ส่วนตัว</span>
          <span className="sm:hidden">เพิ่มลิงค์</span>
        </button>

        {/* Cloudflare Deployment Info & Settings */}
        <button
          onClick={onOpenDeployModal}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="คู่มือ Cloudflare Pages / KV & การตั้งค่า"
          aria-label="Cloudflare Setup"
        >
          <Cloud className="w-5 h-5 text-amber-500" />
        </button>
      </div>
    </header>
  );
};
