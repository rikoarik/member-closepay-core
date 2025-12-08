/**
 * useQuickMenu Hook
 * Hook untuk menggunakan quick menu settings
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllMenuItems,
  getEnabledMenuItems,
  type QuickMenuItem,
} from '../services/quickMenuService';

// Helper untuk deep compare arrays
const arraysEqual = (a: QuickMenuItem[], b: QuickMenuItem[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      item.id === other.id &&
      item.enabled === other.enabled &&
      item.label === other.label &&
      item.icon === other.icon &&
      item.iconBgColor === other.iconBgColor
    );
  });
};

export const useQuickMenu = () => {
  const [menuItems, setMenuItems] = useState<QuickMenuItem[]>([]);
  const [enabledItems, setEnabledItems] = useState<QuickMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const previousEnabledItems = useRef<QuickMenuItem[]>([]);

  // Helper untuk update state hanya jika data berbeda
  const updateMenuData = useCallback((all: QuickMenuItem[], enabled: QuickMenuItem[]) => {
    setMenuItems((prev) => {
      // Update hanya jika berbeda
      if (arraysEqual(prev, all)) {
        return prev;
      }
      return all;
    });

    setEnabledItems((prev) => {
      // Update hanya jika berbeda - ini mencegah re-render yang tidak perlu
      if (arraysEqual(prev, enabled)) {
        return prev;
      }
      previousEnabledItems.current = enabled;
      return enabled;
    });
  }, []);

  const loadMenu = useCallback(async () => {
    try {
      const all = await getAllMenuItems();
      const enabled = await getEnabledMenuItems();
      updateMenuData(all, enabled);
    } catch (error) {
      console.error('Failed to load quick menu:', error);
    } finally {
      setIsLoading(false);
      isInitialLoad.current = false;
    }
  }, [updateMenuData]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const refresh = useCallback(async () => {
    // Hanya set loading jika ini bukan initial load dan data sudah ada
    // Ini mencegah flicker saat refresh
    if (!isInitialLoad.current && enabledItems.length > 0) {
      // Skip loading state untuk refresh, langsung update data
      // Force update dengan membuat array baru untuk memastikan re-render
      try {
        const all = await getAllMenuItems();
        const enabled = await getEnabledMenuItems();
        // Force update dengan membuat array baru meskipun isinya sama
        // Ini penting untuk trigger re-render setelah save di settings
        setMenuItems([...all]);
        setEnabledItems([...enabled]);
        previousEnabledItems.current = enabled;
      } catch (error) {
        console.error('Failed to refresh quick menu:', error);
      }
    } else {
      // Jika masih initial load atau belum ada data, gunakan loading state
      setIsLoading(true);
      try {
        const all = await getAllMenuItems();
        const enabled = await getEnabledMenuItems();
        updateMenuData(all, enabled);
      } catch (error) {
        console.error('Failed to refresh quick menu:', error);
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [enabledItems.length, updateMenuData]);

  return {
    menuItems,
    enabledItems,
    isLoading,
    refresh,
  };
};

