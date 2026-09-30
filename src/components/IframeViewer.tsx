import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  RotateCw,
  Copy,
  Check,
  BookmarkCheck,
  ShieldCheck,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Compass,
  Layers,
  Radio,
  Zap,
  SlidersHorizontal,
  Navigation,
  Car,
  MapPin,
  Route,
} from 'lucide-react';
import { LinkItem, TabId } from '../types';

interface IframeViewerProps {
  currentTab: TabId;
  link: LinkItem;
  isDefault: boolean;
  onSetDefault: (section: TabId, url: string) => void;
  onResetDefault: (section: TabId) => void;
  onOpenManageModal?: () => void;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({
  currentTab,
  link,
  isDefault,
  onSetDefault,
  onResetDefault,
  onOpenManageModal,
}) => {
  const isSiahra = link.url.includes('siahra-radar.co');
  const isFloodboard = link.url.includes('floodboard.org');
  const isFloodBangkok = link.url.includes('floodbangkok.bangkok.go.th');
  const isNdwc = link.url.includes('ndwc.disaster.go.th');
  const isSpecialSite = isSiahra || isFloodboard || isFloodBangkok || isNdwc;

  // Choose viewing mode: 'portal' for interactive hub card, 'proxy' for iframe proxy, 'standard' for regular iframe
  const [embedMode, setEmbedMode] = useState<'proxy' | 'portal' | 'standard'>(() => {
    if (isSpecialSite) return 'portal';
    return link.iframeSafe === false ? 'proxy' : 'standard';
  });

  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute effective iframe src
  const effectiveSrc = React.useMemo(() => {
    if (embedMode === 'proxy' || isSpecialSite) {
      return `/api/proxy?url=${encodeURIComponent(link.url)}`;
    }
    return link.url;
  }, [embedMode, link.url, isSpecialSite]);

  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
    setIframeKey(Date.now());

    if (isSpecialSite) {
      setEmbedMode('portal');
    } else if (link.iframeSafe === false) {
      setEmbedMode('proxy');
    } else {
      setEmbedMode('standard');
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 4500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [link.url, isSpecialSite, link.iframeSafe]);

  const handleReload = () => {
    setIsLoading(true);
    setIframeError(false);
    setIframeKey(Date.now());
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveAsDefault = () => {
    onSetDefault(currentTab, link.url);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2800);
  };

  return (
    <div
      className={`relative flex flex-col flex-1 h-full bg-slate-100 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
      }`}
    >
      {/* Viewer Header / Address Bar */}
      <div className="bg-white border-b border-slate-200 px-3 md:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs md:text-sm font-bold text-slate-800 truncate">
                {link.title}
              </h2>
              {isDefault ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                  หน้าเริ่มต้น
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span className="font-medium text-slate-600">{link.agency}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[10px]">{link.url}</span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher for Sites that require Special Handling (SIAHRA, Floodboard) */}
        {isSpecialSite && (
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
            <button
              onClick={() => setEmbedMode('portal')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                embedMode === 'portal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              หน้ากระดานด่วน
            </button>
            <button
              onClick={() => {
                setEmbedMode('proxy');
                handleReload();
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                embedMode === 'proxy'
                  ? 'bg-white text-[#0077B6] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              โหมดฝังเว็บ (Proxy)
            </button>
          </div>
        )}

        {/* Header Action Tools */}
        <div className="flex items-center gap-1 shrink-0">
          {onOpenManageModal && (
            <button
              onClick={onOpenManageModal}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="จัดการลิงค์ในหมวดนี้"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleReload}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="รีโหลดหน้าเว็บ"
            aria-label="Reload"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0077B6]' : ''}`} />
          </button>

          <button
            onClick={handleCopyUrl}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="คัดลอก URL"
            aria-label="Copy URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0077B6] text-white hover:bg-[#0284C7] shadow-xs transition-colors min-h-[36px]"
            title="เปิดในแท็บใหม่ของเบราว์เซอร์"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>เปิดเว็บตรง</span>
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden md:flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] items-center justify-center"
            title={isFullscreen ? 'ย่อหน้าจอ' : 'เต็มหน้าจอ'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 w-full h-full bg-slate-900/5 overflow-hidden">
        {/* SPECIAL PORTAL VIEW FOR FLOODBOARD.ORG */}
        {embedMode === 'portal' && isFloodboard ? (
          <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-[#0c1e33] text-white p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-6 text-center animate-in fade-in zoom-in-95">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
                <Route className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Floodboard แผนที่น้ำท่วมสด กรุงเทพฯ และทั่วประเทศ</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                  Floodboard.org
                </h1>
                <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  เช็คถนนน้ำท่วมสดเรียลไทม์: ถนนไหนท่วม ลึกกี่ ซม. รถเก๋ง/มอไซค์/กระบะผ่านได้ไหม
                  พร้อมระบบค้นหาเส้นทางเลี่ยงน้ำท่วม เชื่อมโยงข้อมูล กทม. กรมทางหลวง Traffy Fondue และกล้อง CCTV
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <MapPin className="w-5 h-5 text-rose-400 mb-2" />
                  <p className="text-xs font-bold text-white">ถนนน้ำท่วมสด</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ระบุความลึกน้ำระดับ ซม.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Car className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">ประเมินตามประเภทรถ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">เก๋ง มอไซค์ กระบะ รถบรรทุก</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Navigation className="w-5 h-5 text-sky-400 mb-2" />
                  <p className="text-xs font-bold text-white">เส้นทางเลี่ยงน้ำ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ค้นหาทางเลี่ยงน้ำท่วม</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Radio className="w-5 h-5 text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">รายงานเรียลไทม์</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">เชื่อม Traffy Fondue & CCTV</p>
                </div>
              </div>

              {/* Direct Launch Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://floodboard.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-[#0077B6] hover:from-sky-400 hover:to-[#0284C7] text-white font-black text-sm md:text-base shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all min-h-[52px]"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>เปิด Floodboard แผนที่สดเต็มจอ (คลิกเพื่อเข้าใช้งาน)</span>
                </a>

                <button
                  onClick={() => {
                    setEmbedMode('proxy');
                    handleReload();
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs md:text-sm font-semibold transition-all min-h-[52px]"
                >
                  ลองเปิดในโหมดฝังผ่าน Proxy
                </button>
              </div>

              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                💡 Floodboard มีการตั้งค่าความปลอดภัยระดับสูงจาก Cloudflare (X-Frame-Options: DENY)
                แนะนำให้เปิดในหน้าต่างหลักเพื่อประสิทธิภาพในการแสดงผลแผนที่และการนำทางที่ดีที่สุด
              </p>
            </div>
          </div>
        ) : embedMode === 'portal' && isFloodBangkok ? (
          /* SPECIAL PORTAL VIEW FOR FLOOD BANGKOK BMA */
          <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-[#042838] text-white p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
                <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>ศูนย์ข้อมูลน้ำท่วม สำนักการระบายน้ำ กรุงเทพมหานคร</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                  Flood Bangkok (กทม.)
                </h1>
                <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  ระบบตรวจวัดสถานการณ์น้ำท่วม กล้อง CCTV สถานีสูบน้ำ ประตูระบายน้ำ
                  ระดับน้ำคลองสายหลัก และจุดน้ำท่วมขังบนถนนทั่วกรุงเทพมหานคร
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Layers className="w-5 h-5 text-cyan-400 mb-2" />
                  <p className="text-xs font-bold text-white">สถานีสูบน้ำ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">พระโขนง คลองเตย บางเขน</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">ประตูระบายน้ำ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ควบคุมระดับน้ำเจ้าพระยา</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <MapPin className="w-5 h-5 text-sky-400 mb-2" />
                  <p className="text-xs font-bold text-white">ระดับน้ำคลอง</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">คลองแสนแสบ ลาดพร้าว ฯลฯ</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Radio className="w-5 h-5 text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">ถนนน้ำท่วม</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">รายงานจุดท่วมขัง กทม.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://floodbangkok.bangkok.go.th/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-[#0077B6] hover:from-cyan-500 hover:to-[#0284C7] text-white font-black text-sm md:text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all min-h-[52px]"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>เปิดระบบ Flood Bangkok กทม. เต็มจอ (คลิกเพื่อเข้าใช้งาน)</span>
                </a>

                <button
                  onClick={() => {
                    setEmbedMode('proxy');
                    handleReload();
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs md:text-sm font-semibold transition-all min-h-[52px]"
                >
                  ลองเปิดในโหมดฝังผ่าน Proxy
                </button>
              </div>

              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                💡 ศูนย์ข้อมูลน้ำท่วม กทม. มีการตั้งค่าความปลอดภัยจาก Cloudflare แนะนำให้เปิดในหน้าต่างหลักเพื่อความสะดวกรวดเร็วในการติดตามผล
              </p>
            </div>
          </div>
        ) : embedMode === 'portal' && isNdwc ? (
          /* SPECIAL PORTAL VIEW FOR NDWC */
          <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-[#1e1338] text-white p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>ศูนย์เตือนภัยพิบัติแห่งชาติ กรมป้องกันและบรรเทาสาธารณภัย (NDWC)</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                  ศูนย์เตือนภัยพิบัติแห่งชาติ (NDWC)
                </h1>
                <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  กระดานแจ้งเตือนภัยล่วงหน้า หอกระจายข่าวเตือนภัย ประกาศเตือนสาธารณภัย
                  และข้อแนะนำแนวทางการปฏิบัติตนกรณีเกิดอุทกภัยและวาตภัยรุนแรง
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Radio className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="text-xs font-bold text-white">หอเตือนภัย</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">สถานะหอเตือนภัยทั่วประเทศ</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">แจ้งเตือนด่วน</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">น้ำท่วมฉับพลัน ดินโคลนถล่ม</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">ประกาศเตือนภัย</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">รายงานวิเคราะห์สถานการณ์</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Navigation className="w-5 h-5 text-sky-400 mb-2" />
                  <p className="text-xs font-bold text-white">แผนเผชิญเหตุ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">จุดปลอดภัยและการอพยพ</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://ndwc.disaster.go.th/ndwc/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-[#0077B6] hover:from-purple-500 hover:to-[#0284C7] text-white font-black text-sm md:text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all min-h-[52px]"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>เปิดศูนย์เตือนภัย NDWC เต็มจอ (คลิกเพื่อเข้าใช้งาน)</span>
                </a>

                <button
                  onClick={() => {
                    setEmbedMode('proxy');
                    handleReload();
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs md:text-sm font-semibold transition-all min-h-[52px]"
                >
                  ลองเปิดในโหมดฝังผ่าน Proxy
                </button>
              </div>

              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                💡 เว็บไซต์ NDWC มีการตั้งค่าความปลอดภัยจาก Cloudflare แนะนำให้เปิดในหน้าต่างหลักเพื่อรับการแจ้งเตือนและข้อมูลฉุกเฉินได้รวดเร็วที่สุด
              </p>
            </div>
          </div>
        ) : embedMode === 'portal' && isSiahra ? (
          /* SPECIAL PORTAL VIEW FOR SIAHRA RADAR */
          <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-[#001f3f] text-white p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
                <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Spatial Intelligence Atlas for Hazard & Resilience Analytics</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                  SIAHRA Radar Thailand
                </h1>
                <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  แผนที่ข้อมูลเชิงพื้นที่เพื่อการเฝ้าระวังภัยพิบัติของประเทศไทย: ภูมิประเทศ 3 มิติ (3D Terrain),
                  เรดาร์ตรวจวัดกลุ่มฝนแบบเรียลไทม์, ตรวจสอบระดับน้ำในลุ่มน้ำ และการตรวจจับแผ่นดินไหว
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Compass className="w-5 h-5 text-sky-400 mb-2" />
                  <p className="text-xs font-bold text-white">3D Terrain</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">แบบจำลองภูมิประเทศ 3 มิติ</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Radio className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">Live Radar</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">เรดาร์ตรวจจับเมฆฝนสด</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Layers className="w-5 h-5 text-indigo-400 mb-2" />
                  <p className="text-xs font-bold text-white">Water Levels</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ระดับน้ำและอัตราการไหล</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <Zap className="w-5 h-5 text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Earthquake</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">รายงานแผ่นดินไหวล่าสุด</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://siahra-radar.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-[#0077B6] hover:from-sky-400 hover:to-[#0284C7] text-white font-black text-sm md:text-base shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all min-h-[52px]"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>เปิด SIAHRA Radar แบบเต็มหน้าจอ (คลิกเพื่อเข้าใช้งาน)</span>
                </a>

                <button
                  onClick={() => {
                    setEmbedMode('proxy');
                    handleReload();
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 text-xs md:text-sm font-semibold transition-all min-h-[52px]"
                >
                  ลองเปิดในโหมดฝังผ่าน Proxy
                </button>
              </div>

              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                💡 เว็บไซต์ SIAHRA Radar มีการตั้งค่าความปลอดภัยระดับสูง (X-Frame-Options: DENY) จาก Cloudflare
                เพื่อความเร็วและความละเอียดสูงสุดของแผนที่ 3D ขอแนะนำให้เปิดใช้งานผ่านหน้าต่างหลัก
              </p>
            </div>
          </div>
        ) : (
          /* STANDARD / PROXY EMBEDDED IFRAME */
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 backdrop-blur-xs transition-opacity pointer-events-none">
                <div className="w-10 h-10 border-3 border-sky-200 border-t-[#0077B6] rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-700">กำลังเชื่อมต่อข้อมูล...</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{link.agency}</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={effectiveSrc}
              title={link.title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
              referrerPolicy="no-referrer"
              loading="lazy"
            />

            {/* Error or Refusal Overlay */}
            {iframeError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 text-white p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
                <h3 className="text-base font-bold text-white">
                  ไม่สามารถแสดงผลในโหมดฝังหน้าจอได้โดยตรง
                </h3>
                <p className="text-xs text-slate-300 max-w-md mt-1 mb-4 leading-relaxed">
                  เว็บไซต์ปลายทาง ({link.agency}) มีนโยบายจำกัดการแสดงผลใน iframe (X-Frame-Options: DENY)
                  ท่านสามารถเปิดใช้งานผ่านปุ่มด้านล่างได้ทันทีโดยไม่ถูกจำกัด
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-[#0077B6] hover:bg-[#0284C7] text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดเว็บไซต์ {link.title} ทันที</span>
                </a>
              </div>
            )}

            {/* Bottom Bar Info */}
            <div className="absolute bottom-2 left-3 right-3 md:left-4 md:right-auto md:max-w-md z-20 pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-slate-200 shadow-md text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <p className="text-[11px] text-slate-600 truncate">
                    แหล่งข้อมูล: <span className="font-semibold text-slate-800">{link.agency}</span>
                  </p>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0077B6] hover:underline font-bold text-[11px] whitespace-nowrap flex items-center gap-1 shrink-0"
                >
                  <span>เปิดเต็มหน้า</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </>
        )}

        {/* Floating Action Button (FAB - "ติดตามหน้านี้") */}
        <div className="absolute bottom-16 md:bottom-6 right-4 md:right-6 z-30">
          <button
            onClick={handleSaveAsDefault}
            className={`group relative flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 ${
              isDefault
                ? 'bg-emerald-600 text-white shadow-emerald-700/30'
                : 'bg-gradient-to-r from-[#4ADE80] to-[#86EFAC] text-emerald-950 font-bold shadow-emerald-500/30 hover:brightness-105'
            }`}
            style={{ minHeight: '48px', minWidth: '48px' }}
            title="บันทึกหน้านี้เป็นหน้าเริ่มต้นเมื่อเปิดหมวดนี้"
          >
            <BookmarkCheck className={`w-5 h-5 ${isDefault ? 'text-white' : 'text-emerald-950'}`} />
            <span className="text-xs md:text-sm font-bold tracking-tight">
              {isDefault ? 'ติดตามหน้านี้แล้ว (หน้าหลัก)' : 'ติดตามหน้านี้'}
            </span>
          </button>
        </div>

        {/* Saved Success Toast */}
        {showSavedToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-900/95 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>
              ตั้ง <strong className="font-semibold">{link.title}</strong> เป็นหน้าเริ่มต้นหมวดนี้เรียบร้อยแล้ว
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
