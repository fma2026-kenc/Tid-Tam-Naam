import React, { useState, useMemo } from 'react';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TabletSidebar } from './components/TabletSidebar';
import { IframeViewer } from './components/IframeViewer';
import { CustomLinkModal } from './components/CustomLinkModal';
import { ManageLinksModal } from './components/ManageLinksModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { CloudflareDeployModal } from './components/CloudflareDeployModal';
import { DEFAULT_LINKS, SECTIONS } from './data/defaultLinks';
import { LinkItem, TabId, UserPreferences } from './types';
import {
  loadUserPreferences,
  setSectionDefaultUrl,
  updateSectionLinkOrder,
  getSortedSectionLinks,
  saveCustomLink,
  deleteOrHideLink,
  restoreAllHiddenLinks,
  resetSectionDefault,
} from './utils/storage';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [currentTab, setCurrentTab] = useState<TabId>('water_level');
  const [activeLinkByTab, setActiveLinkByTab] = useState<Record<TabId, LinkItem | null>>({
    water_level: null,
    live_cctv: null,
    flood_board: null,
    emergency: null,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [targetAddSection, setTargetAddSection] = useState<TabId>('water_level');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [emergencyViewMode, setEmergencyViewMode] = useState<'directory' | 'webview'>('directory');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'viewer'>('list');
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Combine links, filter hidden ones and permanently deleted ones, and sort each section ensuring default is ALWAYS at index 0
  const allLinks = useMemo(() => {
    const hiddenSet = new Set(preferences.hiddenLinkIds || []);
    const permDeletedSet = new Set(preferences.permanentlyDeletedIds || []);
    const combined = [...preferences.customLinks, ...DEFAULT_LINKS];
    const available = combined.filter((l) => !hiddenSet.has(l.id) && !permDeletedSet.has(l.id));

    const result: LinkItem[] = [];
    const tabs: TabId[] = ['water_level', 'live_cctv', 'flood_board', 'emergency'];
    tabs.forEach((tab) => {
      const sorted = getSortedSectionLinks(
        tab,
        available,
        preferences.defaultUrls[tab],
        preferences.linkOrder?.[tab]
      );
      result.push(...sorted);
    });
    return result;
  }, [preferences.customLinks, preferences.hiddenLinkIds, preferences.permanentlyDeletedIds, preferences.defaultUrls, preferences.linkOrder]);

  // Count custom links per tab
  const customLinksCountByTab = useMemo(() => {
    const counts: Record<TabId, number> = {
      water_level: 0,
      live_cctv: 0,
      flood_board: 0,
      emergency: 0,
    };
    preferences.customLinks.forEach((link) => {
      if (counts[link.section] !== undefined) {
        counts[link.section]++;
      }
    });
    return counts;
  }, [preferences.customLinks]);

  // Determine current active link for the current tab
  const currentActiveLink = useMemo(() => {
    // Check if user has explicitly selected a link in this tab
    const currentSelected = activeLinkByTab[currentTab];
    if (currentSelected && allLinks.some((l) => l.id === currentSelected.id)) {
      return currentSelected;
    }

    // Otherwise, find the link matching user's default URL for this section
    const defaultUrl = preferences.defaultUrls[currentTab];
    const match = allLinks.find((l) => l.section === currentTab && l.url === defaultUrl);
    if (match) return match;

    // Fallback to first available link in this section
    const firstSectionLink = allLinks.find((l) => l.section === currentTab);
    if (firstSectionLink) return firstSectionLink;

    // Absolute fallback
    return DEFAULT_LINKS[0];
  }, [activeLinkByTab, currentTab, preferences.defaultUrls, allLinks]);

  // Set active link for a section
  const handleSelectLink = (link: LinkItem) => {
    setActiveLinkByTab((prev) => ({
      ...prev,
      [currentTab]: link,
    }));
    if (currentTab === 'emergency') {
      setEmergencyViewMode('webview');
    }
    // Switch to viewer mode on smartphone so user sees the web content immediately!
    setMobileViewMode('viewer');
  };

  // Handler for pinning default URL: Automatically moves this link to the very top!
  const handleSetDefault = (section: TabId, url: string) => {
    const updated = setSectionDefaultUrl(section, url);
    setPreferences(updated);
    showToast('ตั้งเป็นหน้าเริ่มต้นและเลื่อนไปอยู่บนสุดแล้ว');
  };

  // Handler for manual drag / nudge reordering
  const handleReorderLinks = (section: TabId, reorderedIds: string[]) => {
    const updated = updateSectionLinkOrder(section, reorderedIds);
    setPreferences(updated);
  };

  const handleResetDefault = (section: TabId) => {
    const updated = resetSectionDefault(section);
    setPreferences(updated);
    showToast('รีเซ็ตหน้าเริ่มต้นเป็นค่าแนะนำแล้ว');
  };

  const handleOpenAddModal = (section?: TabId) => {
    setEditingLink(null);
    setTargetAddSection(section || currentTab);
    setIsAddModalOpen(true);
  };

  const handleEditCustomLink = (link: LinkItem) => {
    setEditingLink(link);
    setTargetAddSection(link.section);
    setIsAddModalOpen(true);
  };

  // Open in-app delete confirmation modal (Replaces window.confirm completely!)
  const handleRequestDeleteLink = (link: LinkItem) => {
    setDeletingLink(link);
  };

  // Confirmed delete execution (support 'hide' or 'permanent' deletion)
  const handleConfirmDelete = (mode: 'hide' | 'permanent') => {
    if (!deletingLink) return;

    const linkId = deletingLink.id;
    const linkTitle = deletingLink.title;
    const updated = deleteOrHideLink(linkId, deletingLink.section, mode);
    setPreferences(updated);

    // If active link was deleted or hidden, reset selection
    if (activeLinkByTab[currentTab]?.id === linkId) {
      setActiveLinkByTab((prev) => ({
        ...prev,
        [currentTab]: null,
      }));
    }

    setDeletingLink(null);
    if (mode === 'permanent') {
      showToast(`ลบ "${linkTitle}" ถาวรเรียบร้อยแล้ว`);
    } else {
      showToast(`ซ่อน "${linkTitle}" เรียบร้อยแล้ว (สามารถกดกู้คืนได้)`);
    }
  };

  const handleRestoreAllHidden = () => {
    const updated = restoreAllHiddenLinks();
    setPreferences(updated);
    showToast('กู้คืนลิงค์ทางการทั้งหมดเรียบร้อยแล้ว');
  };

  const handleSaveCustomLink = (linkData: Omit<LinkItem, 'id'> & { id?: string }) => {
    const { updatedPrefs, linkId } = saveCustomLink(linkData);
    setPreferences(updatedPrefs);

    const savedLink = updatedPrefs.customLinks.find((l) => l.id === linkId);
    if (savedLink && savedLink.section === currentTab) {
      setActiveLinkByTab((prev) => ({
        ...prev,
        [currentTab]: savedLink,
      }));
    }
    showToast('บันทึกข้อมูลลิงค์สำเร็จ');
  };

  const handleTabChange = (tab: TabId) => {
    if (currentTab === tab) {
      // Tapping the active tab on mobile toggles between card list and viewer!
      setMobileViewMode((prev) => (prev === 'list' ? 'viewer' : 'list'));
      return;
    }
    setCurrentTab(tab);
    if (tab === 'emergency') {
      setEmergencyViewMode('directory');
    }
    // When changing to another tab on mobile, show the cards list so user can choose
    setMobileViewMode('list');
  };

  const handleQuickEmergencyReport = (url: string, title: string) => {
    const reportLink: LinkItem = {
      id: 'emergency-report-temp',
      title,
      url,
      section: 'emergency',
      agency: 'กรมป้องกันและบรรเทาสาธารณภัย',
      description: 'ระบบรับแจ้งเหตุสาธารณภัยออนไลน์',
      iframeSafe: true,
    };
    handleSelectLink(reportLink);
    setEmergencyViewMode('webview');
    setMobileViewMode('viewer');
  };

  const currentDefaultUrl = preferences.defaultUrls[currentTab];
  const isCurrentLinkDefault = currentActiveLink?.url === currentDefaultUrl;
  const hasHiddenLinks = (preferences.hiddenLinkIds || []).length > 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenAddModal={() => handleOpenAddModal(currentTab)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenEmergencyQuick={() => {
          handleTabChange('emergency');
          setEmergencyViewMode('directory');
        }}
      />

      {/* Main Responsive Body */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Tablet & Desktop Side Drawer / Bookmark Selector */}
        {currentTab !== 'emergency' || emergencyViewMode === 'webview' ? (
          <div
            className={`${
              mobileViewMode === 'viewer' ? 'hidden md:flex' : 'flex'
            } w-full md:w-80 lg:w-96 shrink-0 h-full`}
          >
            <TabletSidebar
              currentTab={currentTab}
              allLinks={allLinks}
              activeLink={currentActiveLink}
              defaultUrl={currentDefaultUrl}
              hasHiddenLinks={hasHiddenLinks}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onSelectLink={handleSelectLink}
              onOpenAddModal={handleOpenAddModal}
              onOpenManageModal={() => setIsManageModalOpen(true)}
              onEditCustomLink={handleEditCustomLink}
              onRequestDeleteLink={handleRequestDeleteLink}
              onSetDefault={handleSetDefault}
              onRestoreAllHidden={handleRestoreAllHidden}
              onReorderLinks={handleReorderLinks}
              onSwitchToViewer={() => setMobileViewMode('viewer')}
            />
          </div>
        ) : null}

        {/* Content Viewer Area */}
        <main
          className={`${
            mobileViewMode === 'list' && (currentTab !== 'emergency' || emergencyViewMode === 'webview')
              ? 'hidden md:flex'
              : 'flex'
          } flex-1 flex-col min-w-0 h-full relative overflow-hidden`}
        >
          {/* Mobile Top Navigation Bar (Visible only on mobile in viewer mode) */}
          <div className="md:hidden flex items-center justify-between px-3 py-2 bg-slate-900 text-white border-b border-slate-800 shrink-0 z-20 shadow-xs">
            <button
              type="button"
              onClick={() => setMobileViewMode('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold active:scale-95 transition-all min-h-[38px] border border-slate-700/80 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4 text-[#0077B6]" />
              <span>รายการการ์ด ({allLinks.filter((l) => l.section === currentTab).length})</span>
            </button>

            <div className="flex-1 px-2 text-center min-w-0">
              <span className="text-xs font-bold truncate block text-slate-100">
                {currentActiveLink.title}
              </span>
            </div>

            <a
              href={currentActiveLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-[#0077B6] hover:bg-[#0284C7] text-white text-xs font-bold flex items-center gap-1 min-h-[38px] shrink-0 active:scale-95 shadow-xs"
              title="เปิดในแท็บเบราว์เซอร์ใหม่"
            >
              <span>เปิดเว็บ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {currentTab === 'emergency' && emergencyViewMode === 'directory' ? (
            <EmergencyDirectory onSelectReportLink={handleQuickEmergencyReport} />
          ) : (
            <IframeViewer
              currentTab={currentTab}
              link={currentActiveLink}
              isDefault={isCurrentLinkDefault}
              onSetDefault={handleSetDefault}
              onResetDefault={handleResetDefault}
              onOpenManageModal={() => setIsManageModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop / tablet >= lg) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        customLinksCountByTab={customLinksCountByTab}
        mobileViewMode={mobileViewMode}
      />

      {/* Custom Link Builder Modal ("สร้างลิงค์ส่วนตัว") */}
      <CustomLinkModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveCustomLink}
        defaultSection={targetAddSection}
        editingLink={editingLink}
      />

      {/* Comprehensive Manage Links Modal */}
      <ManageLinksModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        currentTab={currentTab}
        links={allLinks.filter((l) => l.section === currentTab)}
        defaultUrl={currentDefaultUrl}
        hasHiddenLinks={hasHiddenLinks}
        onSelectLink={handleSelectLink}
        onRequestDelete={handleRequestDeleteLink}
        onEditCustomLink={handleEditCustomLink}
        onSetDefault={handleSetDefault}
        onOpenAddModal={handleOpenAddModal}
        onRestoreAllHidden={handleRestoreAllHidden}
        onReorderLinks={handleReorderLinks}
      />

      {/* In-App Delete Confirmation Modal (NO window.confirm) */}
      <DeleteConfirmModal
        isOpen={!!deletingLink}
        linkTitle={deletingLink?.title || ''}
        linkAgency={deletingLink?.agency}
        linkUrl={deletingLink?.url}
        isCustom={deletingLink?.isCustom}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingLink(null)}
      />

      {/* Cloudflare Pages / KV / Setup Modal */}
      <CloudflareDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onRefreshData={() => setPreferences(loadUserPreferences())}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-slate-900 text-white text-xs md:text-sm px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
