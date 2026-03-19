
import { PlanMaster, DiscountMaster, DiscountId, PlanId, AppMasterData } from './types';

export const ADMIN_FEE = 4950;

export const DEFAULT_PLANS: PlanMaster[] = [
  {
    id: 'docomo_max',
    name: 'ドコモマックス',
    capacities: [
      { label: '無制限', value: 'unlimited', price: 8448 },
      { label: '3GB', value: '3gb', price: 6798 },
      { label: '1GB', value: '1gb', price: 5698 },
    ],
    voiceConfig: { fiveMinFree: false, baseFiveMinPrice: 880, unlimitedPrice: 1980 },
    allowedDiscounts: ['family_2', 'family_3', 'long_10', 'long_20', 'dcard_reg', 'dcard_gold', 'hikari_home5g', 'denki'],
  },
  {
    id: 'docomo_mini',
    name: 'ドコモmini',
    capacities: [
      { label: '4GB', value: '4gb', price: 2750 },
      { label: '10GB', value: '10gb', price: 3850 },
    ],
    voiceConfig: { fiveMinFree: false, baseFiveMinPrice: 880, unlimitedPrice: 1980 },
    allowedDiscounts: ['dcard_reg', 'dcard_gold', 'hikari_home5g', 'denki'],
  },
  {
    id: 'u15_first',
    name: 'U15はじめてスマホ',
    capacities: [
      { label: '5GB', value: '5gb', price: 1815 },
      { label: '10GB', value: '10gb', price: 2695 },
    ],
    voiceConfig: { fiveMinFree: true, baseFiveMinPrice: 0, unlimitedPrice: 1100 },
    allowedDiscounts: ['dcard_reg', 'dcard_gold'],
  },
  {
    id: 'first_smartphone',
    name: 'はじめてスマホ',
    capacities: [{ label: '1GB', value: '1gb', price: 1815 }],
    voiceConfig: { fiveMinFree: true, baseFiveMinPrice: 0, unlimitedPrice: 1100 },
    allowedDiscounts: ['dcard_reg', 'dcard_gold', 'first_smartphone_wari'],
  },
  {
    id: 'kids',
    name: 'キッズケータイ',
    capacities: [{ label: '固定', value: 'fixed', price: 550 }],
    voiceConfig: { fiveMinFree: false, baseFiveMinPrice: 880, unlimitedPrice: 1980 },
    allowedDiscounts: ['dcard_reg', 'dcard_gold'],
  },
  {
    id: 'keitai',
    name: 'ケータイプラン',
    capacities: [{ label: '固定', value: 'fixed', price: 1507 }],
    voiceConfig: { fiveMinFree: false, baseFiveMinPrice: 880, unlimitedPrice: 1980 },
    allowedDiscounts: ['dcard_reg', 'dcard_gold'],
  },
  {
    id: 'ahamo',
    name: 'ahamo',
    capacities: [
      { label: '30GB', value: '30gb', price: 2970 },
      { label: '110GB', value: '110gb', price: 4950 },
    ],
    voiceConfig: { fiveMinFree: true, baseFiveMinPrice: 0, unlimitedPrice: 1100 },
    allowedDiscounts: [],
  },
];

export const DISCOUNTS: DiscountMaster[] = [
  { id: 'family_2', name: 'みんなドコモ割(2回線)', group: 'family' },
  { id: 'family_3', name: 'みんなドコモ割(3回線+)', group: 'family' },
  { id: 'long_10', name: '長期利用(10年+)', group: 'long' },
  { id: 'long_20', name: '長期利用(20年+)', group: 'long' },
  { id: 'dcard_reg', name: 'dカードお支払い(レギュラー)', group: 'dcard' },
  { id: 'dcard_gold', name: 'dカードお支払い(Gold/他)', group: 'dcard' },
  { id: 'hikari_home5g', name: 'ひかり/home5G', group: 'hikari' },
  { id: 'denki', name: 'でんきセット割', group: 'denki' },
  { id: 'first_smartphone_wari', name: 'はじめてスマホ割', group: 'first_wari' },
];

export const DEFAULT_DISCOUNT_AMOUNTS: Record<PlanId, Partial<Record<DiscountId, number>>> = {
  docomo_max: { family_3: 1210, family_2: 550, long_20: 220, long_10: 110, dcard_reg: 220, dcard_gold: 550, hikari_home5g: 1210, denki: 110 },
  docomo_mini: { dcard_reg: 220, dcard_gold: 550, hikari_home5g: 1210, denki: 110 },
  u15_first: { dcard_reg: 187, dcard_gold: 187 },
  first_smartphone: { dcard_reg: 187, dcard_gold: 187, first_smartphone_wari: 550 },
  kids: { dcard_reg: 187, dcard_gold: 187 },
  keitai: { dcard_reg: 187, dcard_gold: 187 },
  ahamo: {},
};
