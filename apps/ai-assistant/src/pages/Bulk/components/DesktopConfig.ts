import { lazy, type ComponentType } from 'react';
import type { Option, CoalRegionKey, Nh3RegionKey, H2so4RegionKey } from './types';

const makeView = <P>(loader: () => Promise<{ default: ComponentType<P> }>) => ({
  loader,
  component: lazy(loader),
});

export const TAB_ITEMS = [
  { key: 'coal', label: '煤炭' },
  { key: 'nh3', label: '合成氨' },
  { key: 'h2so4', label: '硫酸' },
] as const;

export const CONFIG = {
  coal: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云贵', value: 'yungui' },
    ] as const satisfies ReadonlyArray<Option<CoalRegionKey>>,
    views: {
      nation: makeView(() => import('./Coal/CoalDesktop/CoalNationwide')),
      yungui: makeView(() => import('./Coal/CoalDesktop/CoalYunGui')),
    } as const,
  },
  nh3: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '西南', value: 'xinan' },
    ] as const satisfies ReadonlyArray<Option<Nh3RegionKey>>,
    views: {
      nation: makeView(() => import('./Nh3/Nh3Desktop/Nh3Nationwide')),
      xinan: makeView(() => import('./Nh3/Nh3Desktop/Nh3XiNan')),
    } as const,
  },
  h2so4: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云南及广西', value: 'yunnanguangxi' },
    ] as const satisfies ReadonlyArray<Option<H2so4RegionKey>>,
    views: {
      nation: makeView(() => import('./H2so4/H2so4Desktop/H2so4Nationwide')),
      yunnanguangxi: makeView(() => import('./H2so4/H2so4Desktop/H2so4YunNanGuangXi')),
    } as const,
  },
} as const;
