/**
 * usePluginComponent Hook
 * Hook untuk load plugin component secara dynamic dengan loading/error states
 */

import { useState, useEffect } from 'react';
import { loadPluginComponent } from '../pluginComponentLoader';
import type { PluginManifest } from '../types';

export interface UsePluginComponentOptions {
  pluginId: string;
  componentName: string;
  fallback?: React.ComponentType<any>;
}

export interface UsePluginComponentReturn<T = any> {
  Component: React.ComponentType<T> | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook untuk load plugin component secara dynamic
 */
export function usePluginComponent<T = any>({
  pluginId,
  componentName,
  fallback: Fallback,
}: UsePluginComponentOptions): UsePluginComponentReturn<T> {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedComponent = await loadPluginComponent(pluginId, componentName);

        if (isMounted) {
          setComponent(() => loadedComponent);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load ${pluginId}.${componentName}:`, err);
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [pluginId, componentName]);

  return {
    Component: Component || Fallback || null,
    loading,
    error,
  };
}

