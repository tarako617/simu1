
import { ADMIN_FEE } from '../constants';
import { SimulationState, CalculationResult, AppMasterData } from '../types';

export const calculateTotal = (state: SimulationState, master: AppMasterData): CalculationResult => {
  const plan = master.plans.find(p => p.id === state.planId)!;
  const capacity = plan.capacities.find(c => c.value === state.capacityValue) || plan.capacities[0];
  
  // 1. Base Price
  const basePrice = capacity.price;

  // 2. Voice Price
  let voicePrice = 0;
  if (state.voiceOption === '5min') {
    voicePrice = plan.voiceConfig.fiveMinFree ? 0 : plan.voiceConfig.baseFiveMinPrice;
  } else if (state.voiceOption === 'unlimited') {
    voicePrice = plan.voiceConfig.unlimitedPrice;
  }

  // 2.5 Docomo Mail Price
  // ahamo or docomo_mini (mini plan) only
  let docomoMailPrice = 0;
  if (state.docomoMail && (state.planId === 'ahamo' || state.planId === 'docomo_mini')) {
    docomoMailPrice = 330;
  }

  // 3. Discounts
  const discountDetails: { name: string; amount: number }[] = [];
  let discountTotal = 0;

  state.activeDiscounts.forEach(dId => {
    if (plan.allowedDiscounts.includes(dId)) {
       const amount = master.discountAmounts[state.planId]?.[dId] || 0;
       if (amount > 0) {
         discountTotal += amount;
         discountDetails.push({ name: dId, amount });
       }
    }
  });

  // Plan Subtotal (Base + Voice + Mail - Discount)
  const planSubtotal = Math.max(0, basePrice + voicePrice + docomoMailPrice - discountTotal);

  // 4. Device
  const { totalPrice, discountPrice, residualPrice, paymentMethod } = state.device;
  const netPrice = Math.max(0, totalPrice - discountPrice);
  
  let deviceFirstMonth = 0;
  let deviceMonthly = 0;
  let deviceMonthlyAfter24 = 0;

  if (paymentMethod === 'full') {
    deviceFirstMonth = 0;
    deviceMonthly = 0;
  } else if (paymentMethod === 'residual') {
    const financedAmount = Math.max(0, netPrice - residualPrice);
    // 23回払いで端数は初月
    deviceMonthly = Math.floor(financedAmount / 23);
    deviceFirstMonth = financedAmount - (deviceMonthly * 22);
    // 残価を25回で割る
    deviceMonthlyAfter24 = Math.ceil(residualPrice / 25);
  } else {
    const months = paymentMethod === 'split_12' ? 12 : paymentMethod === 'split_24' ? 24 : 36;
    deviceMonthly = Math.floor(netPrice / months);
    deviceFirstMonth = netPrice - (deviceMonthly * (months - 1));
  }

  // 月額目安は「通常月（2ヶ月目以降）」を表示
  const totalMonthly = planSubtotal + deviceMonthly;

  // 5. Initial Costs (Pro-rated Logic)
  // isProRated: trueなら日割り(残り日数分)、falseなら満額(1ヶ月分)
  let proRatedUsageOnly = 0;
  
  if (state.isProRated) {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - now.getDate() + 1;
    const dailyRate = planSubtotal / daysInMonth;
    proRatedUsageOnly = Math.floor(dailyRate * remainingDays);
  } else {
    proRatedUsageOnly = planSubtotal;
  }
  
  // 初期費用合計 = 事務手数料 + 日割り(または満額)プラン料金 + 端末初回支払
  const proRatedInitialTotal = proRatedUsageOnly + ADMIN_FEE + deviceFirstMonth;

  return {
    basePrice,
    voicePrice,
    docomoMailPrice,
    discountTotal,
    planSubtotal,
    discountDetails,
    deviceFirstMonth,
    deviceMonthly,
    deviceMonthlyAfter24,
    totalMonthly,
    adminFee: ADMIN_FEE,
    proRatedUsageOnly,
    proRatedInitialTotal
  };
};
