import React from 'react';
import { Droplets, Camera, Radio, PhoneCall } from 'lucide-react';
import { TabId } from '../types';
import { SECTIONS } from '../data/defaultLinks';

interface MobileBottomNavProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  customLinksCountByTab?: Record<TabId, number>;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  customLinksCountByTab,
}) => {
  const getIcon = (id: TabId, isActive: boolean) => {
    const iconClass = `w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`;
    switch (id) {
      case 'water_level':
        return <Droplets className={iconClass} />;
      case 'live_cctv':
        return <Camera className={iconClass} />;
      case 'flood_board':
        return <Radio className={iconClass} />;
      case 'emergency':
        return <PhoneCall className={iconClass} />;
      default:
        return <Droplets className={iconClass} />;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg shadow-slate-900/5 pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-1">
        {SECTIONS.map((section) => {
          const isActive = currentTab === section.id;
          const customCount = customLinksCountByTab?.[section.id] || 0;

          return (
            <button
              key={section.id}
              onClick={() => onTabChange(section.id)}
              className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all rounded-xl ${
                isActive
                  ? 'text-[#0077B6] font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute top-1 w-6 h-1 rounded-full bg-[#0077B6]" />
              )}

              <div className="relative mt-1">
                {getIcon(section.id, isActive)}
                {customCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                    {customCount}
                  </span>
                )}
              </div>

              <span className="text-[10px] md:text-[11px] tracking-tight mt-1 truncate max-w-[85px] leading-tight">
                {section.shortName}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
