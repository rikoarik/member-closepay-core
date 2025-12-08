/**
 * Quick Menu Service
 * Service untuk manage quick menu settings menggunakan AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PluginRegistry } from '../plugins/PluginRegistry';

export interface QuickMenuItem {
  id: string;
  label: string;
  enabled: boolean;
  icon?: string;
  iconBgColor?: string;
  route?: string; // Route name untuk navigation
}

const QUICK_MENU_STORAGE_KEY = '@quick_menu_settings';

/**
 * Load quick menu settings dari storage
 */
export const loadQuickMenuSettings = async (): Promise<QuickMenuItem[]> => {
  try {
    const stored = await AsyncStorage.getItem(QUICK_MENU_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load quick menu settings:', error);
  }
  return [];
};

/**
 * Save quick menu settings ke storage
 */
export const saveQuickMenuSettings = async (
  menuItems: QuickMenuItem[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(QUICK_MENU_STORAGE_KEY, JSON.stringify(menuItems));
  } catch (error) {
    console.error('Failed to save quick menu settings:', error);
    throw error;
  }
};

/**
 * Get enabled quick menu items
 */
export const getEnabledQuickMenuItems = async (): Promise<QuickMenuItem[]> => {
  const allItems = await loadQuickMenuSettings();
  return allItems.filter((item) => item.enabled);
};

/**
 * Get menu items from plugin routes that have showInMenu: true
 */
export const getPluginMenuItems = (): QuickMenuItem[] => {
  if (!PluginRegistry.isInitialized()) {
    return [];
  }

  const routes = PluginRegistry.getEnabledRoutes();
  const menuItems: QuickMenuItem[] = [];

  for (const route of routes) {
    if (route.meta?.showInMenu) {
      menuItems.push({
        id: route.name,
        label: route.meta.title || route.name,
        enabled: true,
        icon: route.meta.icon || 'default',
        iconBgColor: undefined, // Will use default from getDefaultBgColor
        route: route.name,
      });
    }
  }

  return menuItems;
};

/**
 * Get all menu items (from storage + plugin routes)
 */
export const getAllMenuItems = async (): Promise<QuickMenuItem[]> => {
  const storedItems = await loadQuickMenuSettings();
  const pluginItems = getPluginMenuItems();

  // Merge stored items with plugin items
  // Plugin items take precedence if they have the same id
  const mergedItems = new Map<string, QuickMenuItem>();

  // Add stored items first
  for (const item of storedItems) {
    mergedItems.set(item.id, item);
  }

  // Add/update with plugin items
  for (const item of pluginItems) {
    // If item already exists in storage, keep its enabled state
    const existing = mergedItems.get(item.id);
    if (existing) {
      mergedItems.set(item.id, {
        ...item,
        enabled: existing.enabled, // Keep user's preference
      });
    } else {
      mergedItems.set(item.id, item);
    }
  }

  return Array.from(mergedItems.values());
};

/**
 * Get enabled menu items (from storage + plugin routes)
 */
export const getEnabledMenuItems = async (): Promise<QuickMenuItem[]> => {
  const allItems = await getAllMenuItems();
  return allItems.filter((item) => item.enabled);
};

