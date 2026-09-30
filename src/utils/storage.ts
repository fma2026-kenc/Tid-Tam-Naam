import { DEFAULT_LINKS } from '../data/defaultLinks';
import { LinkItem, TabId, UserPreferences } from '../types';

const STORAGE_KEY = 'tid_tam_naam_preferences_v3';
const LEGACY_V2 = 'tid_tam_naam_preferences_v2';
const LEGACY_V1 = 'tid_tam_naam_preferences_v1';

// Initial default URLs mapped to each of the 4 sections
export const INITIAL_DEFAULT_URLS: Record<TabId, string> = {
  water_level: 'https://siahra-radar.co', // SIAHRA Radar as default
  live_cctv: 'https://www.bmatraffic.com',
  flood_board: 'https://floodboard.org', // Floodboard.org as default
  emergency: 'https://disaster.go.th/help',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultUrls: INITIAL_DEFAULT_URLS,
  customLinks: [],
  hiddenLinkIds: [],
  permanentlyDeletedIds: [],
  pinnedIds: ['siahra-radar', 'bma-cctv-traffic', 'floodboard-org', 'ddpm-report-1784'],
  sidebarCollapsed: false,
  viewMode: 'embed',
  linkOrder: {
    water_level: [],
    live_cctv: [],
    flood_board: [],
    emergency: [],
  },
};

export function loadUserPreferences(): UserPreferences {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_V2) || localStorage.getItem(LEGACY_V1);
    }

    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);

    // Merge default URLs with newly requested defaults
    const defaultUrls: Record<TabId, string> = {
      ...INITIAL_DEFAULT_URLS,
      ...(parsed.defaultUrls || {}),
    };

    // Ensure water_level defaults to https://siahra-radar.co
    if (!defaultUrls.water_level || defaultUrls.water_level === 'https://www.thaiwater.net') {
      defaultUrls.water_level = 'https://siahra-radar.co';
    }

    // Ensure flood_board defaults to https://floodboard.org
    if (!defaultUrls.flood_board || defaultUrls.flood_board === 'https://www.disaster.go.th') {
      defaultUrls.flood_board = 'https://floodboard.org';
    }

    // Migrate legacy m-traffic link if stored
    if (defaultUrls.live_cctv === 'https://www.m-traffic.net') {
      defaultUrls.live_cctv = 'https://highwaytraffic.go.th/DOHWeb/Home.aspx';
    }

    // Migrate legacy dam CCTV link if stored
    if (defaultUrls.live_cctv === 'https://www.thaiwater.net/v3/cctv') {
      defaultUrls.live_cctv = 'https://egatwater.egat.co.th/RealTimeCCTV';
    }

    // Migrate legacy BMA drainage CCTV link if stored
    if (defaultUrls.live_cctv === 'https://dds.bangkok.go.th/cctv') {
      defaultUrls.live_cctv = 'https://floodbangkok.bangkok.go.th/';
    }

    // Migrate legacy NDWC link if stored
    if (defaultUrls.flood_board === 'https://disaster.go.th/ndwc') {
      defaultUrls.flood_board = 'https://ndwc.disaster.go.th/ndwc/home';
    }

    // Migrate legacy GISTDA link if stored
    if (defaultUrls.water_level === 'https://disaster.gistda.or.th') {
      defaultUrls.water_level = 'https://disaster.gistda.or.th/dashboard';
    }

    const rawLinkOrder = parsed.linkOrder && typeof parsed.linkOrder === 'object' ? parsed.linkOrder : {};
    const linkOrder: Record<TabId, string[]> = {
      water_level: Array.isArray(rawLinkOrder.water_level) ? rawLinkOrder.water_level : [],
      live_cctv: Array.isArray(rawLinkOrder.live_cctv) ? rawLinkOrder.live_cctv : [],
      flood_board: Array.isArray(rawLinkOrder.flood_board) ? rawLinkOrder.flood_board : [],
      emergency: Array.isArray(rawLinkOrder.emergency) ? rawLinkOrder.emergency : [],
    };

    return {
      defaultUrls,
      customLinks: Array.isArray(parsed.customLinks) ? parsed.customLinks : [],
      hiddenLinkIds: Array.isArray(parsed.hiddenLinkIds) ? parsed.hiddenLinkIds : [],
      permanentlyDeletedIds: Array.isArray(parsed.permanentlyDeletedIds) ? parsed.permanentlyDeletedIds : [],
      pinnedIds: Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : DEFAULT_PREFERENCES.pinnedIds,
      sidebarCollapsed: Boolean(parsed.sidebarCollapsed),
      viewMode: parsed.viewMode === 'browser' ? 'browser' : 'embed',
      linkOrder,
    };
  } catch (err) {
    console.warn('Failed to load user preferences from localStorage, using default:', err);
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save user preferences:', err);
  }
}

/**
 * Update default URL for a specific section.
 * Automatically moves the link to the very top (index 0) of the section's card list.
 */
export function setSectionDefaultUrl(section: TabId, url: string, linkId?: string): UserPreferences {
  const current = loadUserPreferences();
  
  // Find matching link id if not provided
  let targetId = linkId;
  if (!targetId) {
    const all = [...current.customLinks, ...DEFAULT_LINKS];
    const match = all.find((l) => l.section === section && l.url === url);
    if (match) targetId = match.id;
  }

  const currentSectionOrder = current.linkOrder?.[section] || [];
  let newSectionOrder = [...currentSectionOrder];

  if (targetId) {
    // Automatically move to the very top (index 0)
    newSectionOrder = [targetId, ...newSectionOrder.filter((id) => id !== targetId)];
  }

  const updated: UserPreferences = {
    ...current,
    defaultUrls: {
      ...current.defaultUrls,
      [section]: url,
    },
    linkOrder: {
      ...(current.linkOrder || {}),
      [section]: newSectionOrder,
    },
  };
  saveUserPreferences(updated);
  return updated;
}

/**
 * Updates manual order of links for a section (from long-press / drag-drop reordering)
 */
export function updateSectionLinkOrder(section: TabId, reorderedIds: string[]): UserPreferences {
  const current = loadUserPreferences();
  const updated: UserPreferences = {
    ...current,
    linkOrder: {
      ...(current.linkOrder || {}),
      [section]: reorderedIds,
    },
  };
  saveUserPreferences(updated);
  return updated;
}

/**
 * Sorts links for a section according to user's custom sequence,
 * ALWAYS ensuring that the current default URL link is at index 0 (topmost).
 */
export function getSortedSectionLinks(
  section: TabId,
  links: LinkItem[],
  defaultUrl: string,
  customOrder?: string[]
): LinkItem[] {
  const sectionLinks = links.filter((l) => l.section === section);
  if (sectionLinks.length <= 1) return sectionLinks;

  let sorted = [...sectionLinks];

  // Apply custom order if present
  if (customOrder && customOrder.length > 0) {
    const orderMap = new Map<string, number>();
    customOrder.forEach((id, index) => orderMap.set(id, index));

    sorted.sort((a, b) => {
      const posA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
      const posB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
      return posA - posB;
    });
  }

  // Requirement: "ถ้าถูกตั้งเป็นค่าเริ่มต้น จะเลื่อนไปอยู่บนสุดโดยอัตโนมัติ"
  const defaultIdx = sorted.findIndex((l) => l.url === defaultUrl);
  if (defaultIdx > 0) {
    const [defaultItem] = sorted.splice(defaultIdx, 1);
    sorted.unshift(defaultItem);
  }

  return sorted;
}

/**
 * Add or update a custom user link ("สร้างลิงค์ส่วนตัว")
 */
export function saveCustomLink(
  link: Omit<LinkItem, 'id'> & { id?: string }
): { updatedPrefs: UserPreferences; linkId: string } {
  const current = loadUserPreferences();
  const id = link.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  // Automatically check if link is siahra-radar, floodboard, or blocks iframe
  const isRestricted =
    link.url.includes('siahra-radar.co') || link.url.includes('floodboard.org');
  const proxyUrl = isRestricted ? `/api/proxy?url=${encodeURIComponent(link.url)}` : undefined;

  const fullLink: LinkItem = {
    ...link,
    id,
    isCustom: true,
    iframeSafe: isRestricted ? false : link.iframeSafe,
    proxyUrl: proxyUrl || link.proxyUrl,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = current.customLinks.findIndex((l) => l.id === id);
  let updatedLinks: LinkItem[];

  if (existingIndex >= 0) {
    updatedLinks = [...current.customLinks];
    updatedLinks[existingIndex] = fullLink;
  } else {
    updatedLinks = [fullLink, ...current.customLinks];
  }

  // If user marked this custom link as default for the section
  const newDefaultUrls = { ...current.defaultUrls };
  const newLinkOrder = { ...(current.linkOrder || {}) };
  if (link.isDefault) {
    newDefaultUrls[link.section] = link.url;
    const currentSectionOrder = newLinkOrder[link.section] || [];
    newLinkOrder[link.section] = [id, ...currentSectionOrder.filter((i) => i !== id)];
  } else if (!newLinkOrder[link.section]?.includes(id)) {
    newLinkOrder[link.section] = [...(newLinkOrder[link.section] || []), id];
  }

  const updatedPrefs: UserPreferences = {
    ...current,
    customLinks: updatedLinks,
    defaultUrls: newDefaultUrls,
    linkOrder: newLinkOrder,
  };

  saveUserPreferences(updatedPrefs);
  return { updatedPrefs, linkId: id };
}

/**
 * Hide or permanently delete a link (custom or official)
 * mode === 'hide': Adds link to hiddenLinkIds (can be restored later via "กู้คืนลิงค์")
 * mode === 'permanent': Permanently deletes from customLinks, or permanently blocks official link
 */
export function deleteOrHideLink(
  linkId: string,
  section: TabId,
  mode: 'hide' | 'permanent' = 'hide'
): UserPreferences {
  const current = loadUserPreferences();
  const isCustom = current.customLinks.some((l) => l.id === linkId);

  let updatedCustomLinks = current.customLinks;
  let updatedHidden = current.hiddenLinkIds || [];
  let updatedPermDeleted = current.permanentlyDeletedIds || [];

  if (mode === 'permanent') {
    if (isCustom) {
      // Permanently remove custom link
      updatedCustomLinks = current.customLinks.filter((l) => l.id !== linkId);
    } else {
      // Permanently block official link
      if (!updatedPermDeleted.includes(linkId)) {
        updatedPermDeleted = [...updatedPermDeleted, linkId];
      }
    }
    // Also remove from hidden list if present
    updatedHidden = updatedHidden.filter((id) => id !== linkId);
  } else {
    // Mode is 'hide': temporarily hide so user can restore it later
    if (!updatedHidden.includes(linkId)) {
      updatedHidden = [...updatedHidden, linkId];
    }
  }

  // Remove from custom order for this section
  const currentSectionOrder = current.linkOrder?.[section] || [];
  const newSectionOrder = currentSectionOrder.filter((id) => id !== linkId);

  // Check if deleted/hidden link was currently the default
  let newDefaultUrls = { ...current.defaultUrls };
  const targetLink =
    current.customLinks.find((l) => l.id === linkId) ||
    DEFAULT_LINKS.find((l) => l.id === linkId);

  if (targetLink && newDefaultUrls[section] === targetLink.url) {
    if (section === 'water_level') {
      newDefaultUrls.water_level =
        linkId === 'siahra-radar' ? 'https://www.thaiwater.net' : 'https://siahra-radar.co';
    } else if (section === 'flood_board') {
      newDefaultUrls.flood_board =
        linkId === 'floodboard-org' ? 'https://www.disaster.go.th' : 'https://floodboard.org';
    } else {
      newDefaultUrls[section] = INITIAL_DEFAULT_URLS[section];
    }
  }

  const updatedPrefs: UserPreferences = {
    ...current,
    customLinks: updatedCustomLinks,
    hiddenLinkIds: updatedHidden,
    permanentlyDeletedIds: updatedPermDeleted,
    defaultUrls: newDefaultUrls,
    pinnedIds: current.pinnedIds.filter((id) => id !== linkId),
    linkOrder: {
      ...(current.linkOrder || {}),
      [section]: newSectionOrder,
    },
  };

  saveUserPreferences(updatedPrefs);
  return updatedPrefs;
}

/**
 * Restore all hidden official links
 */
export function restoreAllHiddenLinks(): UserPreferences {
  const current = loadUserPreferences();
  const updatedPrefs: UserPreferences = {
    ...current,
    hiddenLinkIds: [],
  };
  saveUserPreferences(updatedPrefs);
  return updatedPrefs;
}

/**
 * Delete a custom link specifically
 */
export function removeCustomLink(linkId: string): UserPreferences {
  const current = loadUserPreferences();
  const updatedPrefs: UserPreferences = {
    ...current,
    customLinks: current.customLinks.filter((l) => l.id !== linkId),
    pinnedIds: current.pinnedIds.filter((id) => id !== linkId),
  };
  saveUserPreferences(updatedPrefs);
  return updatedPrefs;
}

/**
 * Reset default URL for a section back to official recommended source
 */
export function resetSectionDefault(section: TabId): UserPreferences {
  const current = loadUserPreferences();
  const updated: UserPreferences = {
    ...current,
    defaultUrls: {
      ...current.defaultUrls,
      [section]: INITIAL_DEFAULT_URLS[section],
    },
  };
  saveUserPreferences(updated);
  return updated;
}

/**
 * Export preferences as JSON
 */
export function exportPreferencesJSON(): string {
  const prefs = loadUserPreferences();
  return JSON.stringify(prefs, null, 2);
}

/**
 * Import preferences from JSON
 */
export function importPreferencesJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.defaultUrls) return false;
    saveUserPreferences({
      defaultUrls: { ...INITIAL_DEFAULT_URLS, ...parsed.defaultUrls },
      customLinks: Array.isArray(parsed.customLinks) ? parsed.customLinks : [],
      hiddenLinkIds: Array.isArray(parsed.hiddenLinkIds) ? parsed.hiddenLinkIds : [],
      pinnedIds: Array.isArray(parsed.pinnedIds) ? parsed.pinnedIds : DEFAULT_PREFERENCES.pinnedIds,
      sidebarCollapsed: Boolean(parsed.sidebarCollapsed),
      viewMode: parsed.viewMode === 'browser' ? 'browser' : 'embed',
    });
    return true;
  } catch (e) {
    console.error('Invalid JSON import:', e);
    return false;
  }
}
