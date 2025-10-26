import { lazy, type ComponentType } from 'react';
import type {
  MobileViewProps,
  Option,
  TabKey,
  CoalRegionKey,
  Nh3RegionKey,
  H2so4RegionKey,
} from './types';

const makeView = <P>(loader: () => Promise<{ default: ComponentType<P> }>) => ({
  loader,
  component: lazy(loader),
});

export const TAB_ITEMS = [
  { key: 'coal', label: '煤炭' },
  { key: 'nh3', label: '合成氨' },
  { key: 'h2so4', label: '硫酸' },
] as const;

export const CONFIG: Record<TabKey, any> = {
  coal: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云贵', value: 'yungui' },
    ] as const satisfies ReadonlyArray<Option<CoalRegionKey>>,
    views: {
      nation: makeView<MobileViewProps>(() => import('./Coal/CoalMobile/CoalMobileNationwide')),
      yungui: makeView<MobileViewProps>(() => import('./Coal/CoalMobile/CoalMobileYunGui')),
    },
  },
  nh3: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '西南', value: 'xinan' },
    ] as const satisfies ReadonlyArray<Option<Nh3RegionKey>>,
    views: {
      nation: makeView<MobileViewProps>(() => import('./Nh3/Nh3Mobile/Nh3NationwideMobile')),
      xinan: makeView<MobileViewProps>(() => import('./Nh3/Nh3Mobile/Nh3XiNanMobile')),
    },
  },
  h2so4: {
    options: [
      { label: '全国', value: 'nation' },
      { label: '云南及广西', value: 'yunnanguangxi' },
    ] as const satisfies ReadonlyArray<Option<H2so4RegionKey>>,
    views: {
      nation: makeView<MobileViewProps>(() => import('./H2so4/H2so4Mobile/H2so4NationwideMobile')),
      yunnanguangxi: makeView<MobileViewProps>(
        () => import('./H2so4/H2so4Mobile/H2so4YunNanGuangXiMobile'),
      ),
    },
  },
} as const;
