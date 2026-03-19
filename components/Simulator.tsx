
import React, { useState } from 'react';
import { SimulationState, PlanId, DiscountId, VoiceOptionId, DevicePaymentMethod, PlanMaster, SavedDevice, DeviceState } from '../types';
import { DISCOUNTS } from '../constants';
import { Calculator, Wifi, Smartphone, Check, CreditCard, Save, X, Check as CheckIcon, CalendarDays } from 'lucide-react';

interface Props {
  state: SimulationState;
  onChange: (newState: SimulationState) => void;
  label?: string;
  plans: PlanMaster[];
  savedDevices?: SavedDevice[];
  onSaveDevice?: (name: string, device: DeviceState) => void;
}

export const Simulator: React.FC<Props> = ({ state, onChange, label, plans, savedDevices = [], onSaveDevice }) => {
  const selectedPlan = plans.find(p => p.id === state.planId) || plans[0];
  const [isSaving, setIsSaving] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');

  const updateState = (key: keyof SimulationState, value: any) => {
    onChange({ ...state, [key]: value });
  };

  const toggleDiscount = (id: DiscountId) => {
    let newDiscounts = [...state.activeDiscounts];
    if (newDiscounts.includes(id)) {
      newDiscounts = newDiscounts.filter(d => d !== id);
    } else {
      const discountDef = DISCOUNTS.find(d => d.id === id);
      if (discountDef) {
        const groupMembers = DISCOUNTS.filter(d => d.group === discountDef.group).map(d => d.id);
        newDiscounts = newDiscounts.filter(d => !groupMembers.includes(d));
        newDiscounts.push(id);
      }
    }
    updateState('activeDiscounts', newDiscounts);
  };

  const handleDeviceChange = (field: string, val: string) => {
    const num = val === '' ? 0 : parseInt(val, 10);
    updateState('device', { ...state.device, [field]: isNaN(num) ? 0 : num });
  };

  const handleLoadDevice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    const preset = savedDevices.find(d => d.id === deviceId);
    if (preset) {
      updateState('device', { ...preset.device });
    }
    // Reset selection visually
    e.target.value = "";
  };

  const startSave = () => {
    setIsSaving(true);
    setNewDeviceName('');
  };

  const cancelSave = () => {
    setIsSaving(false);
    setNewDeviceName('');
  };

  const confirmSave = () => {
    if (newDeviceName.trim() && onSaveDevice) {
      onSaveDevice(newDeviceName, state.device);
      setIsSaving(false);
      setNewDeviceName('');
      alert(`「${newDeviceName}」を保存しました`);
    }
  };

  const renderDeviceInfo = () => {
    const { totalPrice, discountPrice, residualPrice, paymentMethod } = state.device;
    const netPrice = Math.max(0, totalPrice - discountPrice);

    if (paymentMethod === 'full') {
      return (
        <div className="bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-[10px] font-black animate-in fade-in zoom-in duration-300 shadow-sm border border-orange-200">
          一括支払額：{netPrice.toLocaleString()}円
        </div>
      );
    }

    if (paymentMethod === 'residual') {
      const financedAmount = Math.max(0, netPrice - residualPrice);
      const baseMonthly = Math.floor(financedAmount / 23);
      const firstMonth = financedAmount - (baseMonthly * 22);
      const monthlyResidualSplit = Math.ceil(residualPrice / 25);
      
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-[10px] font-black shadow-sm border border-orange-200">
            初回：{firstMonth.toLocaleString()}円 / 2〜23回：{baseMonthly.toLocaleString()}円
          </div>
          <div className="bg-white text-gray-500 px-3 py-0.5 rounded-full text-[9px] font-bold border border-gray-200">
            残価25分割時：{monthlyResidualSplit.toLocaleString()}円/月
          </div>
        </div>
      );
    }

    // 分割払い (12/24/36)
    const months = paymentMethod === 'split_12' ? 12 : paymentMethod === 'split_24' ? 24 : 36;
    const baseMonthly = Math.floor(netPrice / months);
    const firstMonth = netPrice - (baseMonthly * (months - 1));

    return (
      <div className="bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm border border-orange-200">
        初回：{firstMonth.toLocaleString()}円 / 2回目以降：{baseMonthly.toLocaleString()}円
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200/50 overflow-hidden flex flex-col h-full transition-all hover:shadow-2xl">
      {label && <div className="bg-gray-50 px-6 py-3 font-black text-[10px] text-gray-400 border-b border-gray-100 tracking-[0.2em] uppercase">{label}</div>}
      
      <div className="p-6 sm:p-8 space-y-10 flex-1">
        
        {/* PLAN SELECTION */}
        <section>
          <h3 className="text-[11px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <Wifi className="w-4 h-4 text-primary" /> プランの選択
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => {
                   onChange({
                     ...state, 
                     planId: plan.id, 
                     capacityValue: plan.capacities[0].value
                   })
                }}
                className={`p-4 rounded-2xl text-sm font-black border-2 transition-all duration-300 text-left relative overflow-hidden ${
                  state.planId === plan.id
                    ? 'bg-primary text-white border-primary shadow-lg shadow-red-100'
                    : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="relative z-10">{plan.name}</div>
                {state.planId === plan.id && <Check className="absolute top-2 right-2 w-4 h-4 opacity-50" />}
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedPlan.capacities.map(cap => (
              <button
                key={cap.value}
                onClick={() => updateState('capacityValue', cap.value)}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold border-2 transition-all duration-200 ${
                  state.capacityValue === cap.value
                    ? 'bg-secondary text-white border-secondary shadow-md scale-105'
                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                }`}
              >
                {cap.label}
              </button>
            ))}
          </div>
        </section>

        {/* VOICE OPTIONS */}
        <section>
          <h3 className="text-[11px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <Smartphone className="w-4 h-4 text-blue-500" /> 通話オプション
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'none', label: 'なし' },
              { id: '5min', label: '5分通話' },
              { id: 'unlimited', label: 'かけ放題' }
            ].map(opt => {
              const id = opt.id as VoiceOptionId;
              let priceLabel = '';
              if (id === '5min') {
                priceLabel = selectedPlan.voiceConfig.fiveMinFree ? '無料' : `+${selectedPlan.voiceConfig.baseFiveMinPrice}円`;
              } else if (id === 'unlimited') {
                priceLabel = `+${selectedPlan.voiceConfig.unlimitedPrice}円`;
              }

              return (
                <button
                  key={id}
                  onClick={() => updateState('voiceOption', id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                    state.voiceOption === id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105'
                      : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span className="font-black text-xs mb-1">{opt.label}</span>
                  <span className="text-[10px] font-bold opacity-70">{priceLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* DISCOUNTS */}
        <section>
          <h3 className="text-[11px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <Calculator className="w-4 h-4 text-green-500" /> セット割引・優待
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {DISCOUNTS.map(d => {
              const isAllowed = selectedPlan.allowedDiscounts.includes(d.id);
              const isActive = state.activeDiscounts.includes(d.id);

              return (
                <button
                  key={d.id}
                  disabled={!isAllowed}
                  onClick={() => toggleDiscount(d.id)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all duration-300 group ${
                    !isAllowed
                      ? 'bg-gray-50 text-gray-300 border-gray-50 opacity-40 cursor-not-allowed line-through'
                      : isActive
                      ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100'
                      : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="text-[11px] font-black leading-tight pr-4">{d.name}</div>
                  {isActive && <div className="absolute top-2 right-2"><Check className="w-3.5 h-3.5" /></div>}
                </button>
              );
            })}
          </div>
        </section>

        {/* DEVICE */}
        <section>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest pt-2">
               <CreditCard className="w-4 h-4 text-orange-500" /> 端末代金
            </h3>
            {renderDeviceInfo()}
          </div>
          
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100">
            {/* プリセット読み込み・保存行 */}
            <div className="flex gap-2 mb-2 h-10">
               {isSaving ? (
                 <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                    <input 
                      type="text"
                      className="flex-1 bg-white border-2 border-primary text-xs font-bold rounded-xl px-3 outline-none shadow-inner"
                      placeholder="端末名を入力..."
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      autoFocus
                    />
                    <button 
                      onClick={confirmSave} 
                      disabled={!newDeviceName.trim()} 
                      className="bg-primary hover:bg-red-700 text-white text-xs font-black px-3 rounded-xl disabled:opacity-50 transition-colors flex items-center"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={cancelSave} 
                      className="bg-gray-200 hover:bg-gray-300 text-gray-500 text-xs font-black px-3 rounded-xl transition-colors flex items-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                 </div>
               ) : (
                 <>
                   <select 
                     className="flex-1 bg-white border border-gray-200 text-xs font-bold rounded-xl px-3 outline-none focus:border-orange-400 cursor-pointer"
                     onChange={handleLoadDevice}
                     defaultValue=""
                   >
                     <option value="" disabled>保存リストから呼び出し...</option>
                     {savedDevices.map(d => (
                       <option key={d.id} value={d.id}>{d.name}</option>
                     ))}
                   </select>
                   <button 
                     onClick={startSave}
                     className="flex items-center gap-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-black px-4 rounded-xl transition-colors whitespace-nowrap"
                   >
                     <Save className="w-3 h-3" /> 保存
                   </button>
                 </>
               )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-[10px] font-black text-gray-400 block mb-1.5 uppercase">総額(税込)</span>
                <input 
                  type="number" 
                  value={state.device.totalPrice || ''}
                  onChange={(e) => handleDeviceChange('totalPrice', e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl font-black text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-gray-400 block mb-1.5 uppercase">機種割引</span>
                <input 
                  type="number" 
                  value={state.device.discountPrice || ''}
                  onChange={(e) => handleDeviceChange('discountPrice', e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl font-black text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                  placeholder="0"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-gray-400 block mb-1.5 uppercase">残価(24回)</span>
                <input 
                  type="number" 
                  value={state.device.residualPrice || ''}
                  onChange={(e) => handleDeviceChange('residualPrice', e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl font-black text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                  placeholder="0"
                />
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'residual', label: '残価型' },
                { id: 'split_12', label: '12回' },
                { id: 'split_24', label: '24回' },
                { id: 'split_36', label: '36回' },
                { id: 'full', label: '一括' },
              ].map(opt => (
                 <button
                  key={opt.id}
                  onClick={() => updateState('device', { ...state.device, paymentMethod: opt.id as any })}
                  className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black border-2 transition-all duration-300 ${
                    state.device.paymentMethod === opt.id
                      ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CALCULATION OPTIONS */}
        <section className="space-y-3">
          <h3 className="text-[11px] font-black text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <CalendarDays className="w-4 h-4 text-gray-500" /> オプション
          </h3>
          
          {/* Docomo Mail Option (Only for ahamo and docomo_mini) */}
          {(state.planId === 'ahamo' || state.planId === 'docomo_mini') ? (
            <button
              onClick={() => updateState('docomoMail', !state.docomoMail)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                state.docomoMail
                  ? 'bg-white border-primary/50 text-primary' 
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <div className="text-left">
                <div className="text-sm font-bold">ドコモメール持ち運び</div>
                <div className="text-[10px] opacity-70">月額 +330円</div>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-colors ${state.docomoMail ? 'bg-primary' : 'bg-gray-300'}`}>
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${state.docomoMail ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </button>
          ) : (
            <div className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 bg-gray-50/30 text-gray-400">
              <div className="text-left">
                <div className="text-sm font-bold">ドコモメール</div>
                <div className="text-[10px] opacity-70">プランに含まれています</div>
              </div>
              <div className="text-[10px] font-black bg-gray-200 text-gray-500 px-2 py-1 rounded-md uppercase">無料</div>
            </div>
          )}

          <button
            onClick={() => updateState('isProRated', !state.isProRated)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
              state.isProRated
                ? 'bg-white border-primary/50 text-primary' 
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="text-sm font-bold">初月日割り計算</div>
            <div className={`relative w-12 h-6 rounded-full transition-colors ${state.isProRated ? 'bg-primary' : 'bg-gray-300'}`}>
               <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${state.isProRated ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </button>
          <p className="mt-2 text-[10px] text-gray-400 text-right">
            {state.isProRated ? '※本日からの日割り料金で算出します' : '※満額（1ヶ月分）で算出します'}
          </p>
        </section>
      </div>
    </div>
  );
};
