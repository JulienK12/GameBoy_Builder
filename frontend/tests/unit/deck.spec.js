/**
 * Tests unitaires du store deck (Story 3.1).
 * Vérifient la limite de 3 configurations, addCurrentConfig, removeConfig, canAddMore.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDeckStore } from '@/stores/deck';

// Mock configurator : retourne un état minimal pour buildConfigurationSnapshot et quote
vi.mock('@/stores/configurator', () => ({
  useConfiguratorStore: () => ({
    selectedShellVariantId: 'shell-1',
    selectedScreenVariantId: 'screen-1',
    selectedLensVariantId: null,
    selectedExpertOptions: null,
    selectedShellColorHex: '#000000',
    quote: { total_price: 42.5 },
  }),
}));

vi.mock('@/api/backend', () => ({
  getShellImageUrl: (id) => `http://example.com/shells/${id}.jpg`,
}));

describe('Store deck (Story 3.1)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('canAddMore est true quand le deck est vide', () => {
    const store = useDeckStore();
    expect(store.configurations).toHaveLength(0);
    expect(store.canAddMore).toBe(true);
  });

  it('addCurrentConfig ajoute une entrée avec nom par défaut "Configuration 1"', () => {
    const store = useDeckStore();
    const added = store.addCurrentConfig();
    expect(added).toBe(true);
    expect(store.configurations).toHaveLength(1);
    expect(store.configurations[0].name).toBe('Configuration 1');
    expect(store.configurations[0].totalPrice).toBe(42.5);
    expect(store.configurations[0].id).toBeDefined();
    expect(store.configurations[0].configuration).toBeDefined();
  });

  it('addCurrentConfig utilise le nom fourni quand il est renseigné', () => {
    const store = useDeckStore();
    store.addCurrentConfig('  Mon projet A  ');
    expect(store.configurations[0].name).toBe('Mon projet A');
  });

  it('canAddMore reste true avec 1 puis 2 configurations', () => {
    const store = useDeckStore();
    store.addCurrentConfig();
    expect(store.canAddMore).toBe(true);
    store.addCurrentConfig();
    expect(store.canAddMore).toBe(true);
  });

  it('refuse d\'ajouter au-delà de 3 configurations (AC #2)', () => {
    const store = useDeckStore();
    expect(store.addCurrentConfig()).toBe(true);
    expect(store.addCurrentConfig()).toBe(true);
    expect(store.addCurrentConfig()).toBe(true);
    expect(store.configurations).toHaveLength(3);
    expect(store.canAddMore).toBe(false);
    const fourth = store.addCurrentConfig();
    expect(fourth).toBe(false);
    expect(store.configurations).toHaveLength(3);
  });

  it('removeConfig retire l\'entrée par id et libère un emplacement (AC #3)', () => {
    const store = useDeckStore();
    store.addCurrentConfig();
    store.addCurrentConfig();
    store.addCurrentConfig();
    expect(store.canAddMore).toBe(false);
    const idToRemove = store.configurations[1].id;
    store.removeConfig(idToRemove);
    expect(store.configurations).toHaveLength(2);
    expect(store.canAddMore).toBe(true);
    expect(store.configurations.find((c) => c.id === idToRemove)).toBeUndefined();
  });

  it('getPreviewImageUrl retourne une URL quand shellVariantId est présent', () => {
    const store = useDeckStore();
    store.addCurrentConfig();
    const entry = store.configurations[0];
    const url = store.getPreviewImageUrl(entry);
    expect(url).toBe('http://example.com/shells/shell-1.jpg');
  });

  it('getPreviewImageUrl retourne une chaîne vide sans shellVariantId (placeholder)', () => {
    const store = useDeckStore();
    const url = store.getPreviewImageUrl({ configuration: {} });
    expect(url).toBe('');
  });
});
