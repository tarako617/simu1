
export type PlanId = 
  | 'docomo_max'
  | 'docomo_mini'
  | 'u15_first'
  | 'first_smartphone'
  | 'kids'
  | 'keitai'
  | 'ahamo';

export type VoiceOptionId = 'none' | '5min' | 'unlimited';

export type DiscountId = 
  | 'family_2' 
  | 'family_3' 
  | 'long_10' 
  | 'long_20' 
  | 'dcard_reg' 
  | 'dcard_gold' 
  | 'hikari_home5g' 
  | 'denki' 
  | 'first_smartphone_wari';

export type DevicePaymentMethod = 'residual' | 'split_12' | 'split_24' | 'split_36' | 'full';

export interface PlanMaster {
  id: PlanId;
  name: string;
  capacities: {
    label: string;
    price: number;
    value: string;
  }[];
  voiceConfig: {
    fiveMinFree: boolean;
    unlimitedPrice: number;
    baseFiveMinPrice: number;
  };
  allowedDiscounts: DiscountId[];
}

export interface DiscountMaster {
  id: DiscountId;
  name: string;
  group: string;
}

export interface DeviceState {
  totalPrice: number;
  discountPrice: number;
  residualPrice: number;
  paymentMethod: DevicePaymentMethod;
}

export interface SavedDevice {
  id: string;
  name: string;
  device: DeviceState;
}

export interface SimulationState {
  planId: PlanId;
  capacityValue: string;
  voiceOption: VoiceOptionId;
  activeDiscounts: DiscountId[];
  device: DeviceState;
  isProRated: boolean;
  docomoMail: boolean;
}

export interface CalculationResult {
  basePrice: number;
  voicePrice: number;
  docomoMailPrice: number;
  discountTotal: number;
  planSubtotal: number; // 基本料+通話-割引
  discountDetails: { name: string; amount: number }[];
  deviceFirstMonth: number; // 初回支払分
  deviceMonthly: number;    // 2回目以降
  deviceMonthlyAfter24?: number;
  totalMonthly: number;
  adminFee: number;
  proRatedUsageOnly: number; // 事務手数料抜きの日割り分
  proRatedInitialTotal: number; // 合計
}

// 設定保存用の型
export interface AppMasterData {
  plans: PlanMaster[];
  discountAmounts: Record<PlanId, Record<DiscountId, number>>;
  savedDevices: SavedDevice[];
}
