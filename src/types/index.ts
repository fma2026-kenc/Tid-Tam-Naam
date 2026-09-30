export type TabId = 'water_level' | 'live_cctv' | 'flood_board' | 'emergency';

export interface LinkItem {
  id: string;
  title: string;
  titleEn?: string;
  url: string;
  section: TabId;
  agency: string;
  description: string;
  badge?: string;
  isCustom?: boolean;
  isDefault?: boolean;
  tags?: string[];
  iframeSafe?: boolean;
  proxyUrl?: string;
  directEmbedUrl?: string;
  icon?: string;
  updatedAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  tel: string;
  shortNumber: string;
  agency: string;
  category: 'hotline' | 'medical' | 'flood_bma' | 'utility' | 'traffic';
  description: string;
  available: string;
  primary?: boolean;
}

export interface SectionMeta {
  id: TabId;
  title: string;
  subtitle: string;
  shortName: string;
  iconName: string;
  description: string;
  accentColor: string;
}

export interface UserPreferences {
  defaultUrls: Record<TabId, string>;
  customLinks: LinkItem[];
  hiddenLinkIds: string[];
  permanentlyDeletedIds?: string[];
  pinnedIds: string[];
  sidebarCollapsed: boolean;
  viewMode: 'embed' | 'browser';
  linkOrder?: Partial<Record<TabId, string[]>>;
}
