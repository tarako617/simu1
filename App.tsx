
import React, { useState, useEffect } from 'react';
import { SimulationState, PlanId, AppMasterData, DiscountId, DeviceState } from './types';
import { DEFAULT_PLANS, DEFAULT_DISCOUNT_AMOUNTS, DISCOUNTS } from './constants';
import { Simulator } from './components/Simulator';
import { SummaryFooter } from './components/SummaryFooter';
import { Settings, Copy, RotateCcw, X, Save, RefreshCcw, Trash2, Smartphone } from 'lucide-react';

const INITIAL_STATE: SimulationState = {
  planId: 'docomo_max',
  capacityValue: 'unlimited',
  voiceOption: 'none',
  activeDiscounts: [],
  device: {
    totalPrice: 0,
    discountPrice: 0,
    residualPrice: 0,
    paymentMethod: 'residual'
  },
  isProRated: true,
  docomoMail: false
};

const STORAGE_KEY = 'mobile_plan_master_data';

export default function App() {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [stateA, setStateA] = useState<SimulationState>(INITIAL_STATE);
  const [stateB, setStateB] = useState<SimulationState>(INITIAL_STATE);
  const [showSettings, setShowSettings] = useState(false);
  
  const [masterData, setMasterData] = useState<AppMasterData>({
    plans: DEFAULT_PLANS,
    discountAmounts: DEFAULT_DISCOUNT_AMOUNTS as any,
    savedDevices: []
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMasterData({
          plans: parsed.plans && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS,
          discountAmounts: parsed.discountAmounts || DEFAULT_DISCOUNT_AMOUNTS as any,
          savedDevices: parsed.savedDevices || []
        });
      } catch (e) {
        console.error("Failed to parse master data", e);
      }
    }
  }, []);

  const saveMasterData = (newData: AppMasterData) => {
    setMasterData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setShowSettings(false); // 設定画面からの保存時は閉じる
  };

  // 設定画面を開かずにデータだけ更新する（Simulatorからの端末保存用）
  const updateMasterDataDirectly = (newData: AppMasterData) => {
    setMasterData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const resetToDefault = () => {
    if (confirm('設定をすべて初期値に戻しますか？')) {
      const defaultData = { 
        plans: DEFAULT_PLANS, 
        discountAmounts: DEFAULT_DISCOUNT_AMOUNTS as any,
        savedDevices: []
      };
      setMasterData(defaultData);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const resetAllInputs = () => {
    if (confirm('入力内容をリセットしますか？')) {
      setStateA(INITIAL_STATE);
      setStateB(INITIAL_STATE);
    }
  };

  const copyAtoB = () => {
    setStateB(JSON.parse(JSON.stringify(stateA)));
  };

  const handleSaveDevicePreset = (name: string, device: DeviceState) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      device: { ...device } // Deep copy
    };
    const newData = {
      ...masterData,
      savedDevices: [...masterData.savedDevices, newPreset]
    };
    updateMasterDataDirectly(newData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-red-100 selection:text-red-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
             <div className="w-2 h-8 bg-primary rounded-full"></div>
             <h1 className="text-xl font-black text-gray-800 tracking-tighter">料金シミュレーター</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                <button 
                  onClick={() => setIsCompareMode(false)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${!isCompareMode ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
                >
                  単独
                </button>
                <button 
                  onClick={() => setIsCompareMode(true)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${isCompareMode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                >
                  比較
                </button>
             </div>
             <div className="flex items-center gap-1 border-l border-gray-200 ml-1 pl-3 sm:gap-2">
                <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-full transition-all" title="設定">
                  <Settings className="w-5 h-5" />
                </button>
                <button onClick={resetAllInputs} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all" title="リセット">
                  <RotateCcw className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 py-6 pb-48 max-w-7xl mx-auto w-full">
        {isCompareMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             {/* Plan A Side */}
             <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-3 px-1">
                   <span className="text-xs font-black text-white bg-primary px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">プラン A</span>
                </div>
                <Simulator 
                  state={stateA} 
                  onChange={setStateA} 
                  plans={masterData.plans} 
                  savedDevices={masterData.savedDevices}
                  onSaveDevice={handleSaveDevicePreset}
                />
             </div>
             
             {/* Plan B Side */}
             <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-3 px-1">
                   <span className="text-xs font-black text-white bg-blue-600 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">プラン B</span>
                   <button onClick={copyAtoB} className="text-[10px] sm:text-xs flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-all active:scale-95">
                     <Copy className="w-3.5 h-3.5" /> Aの設定をコピー
                   </button>
                </div>
                <Simulator 
                  state={stateB} 
                  onChange={setStateB} 
                  plans={masterData.plans} 
                  savedDevices={masterData.savedDevices}
                  onSaveDevice={handleSaveDevicePreset}
                />
             </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            <Simulator 
              state={stateA} 
              onChange={setStateA} 
              plans={masterData.plans} 
              savedDevices={masterData.savedDevices}
              onSaveDevice={handleSaveDevicePreset}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <SummaryFooter 
        stateA={stateA} 
        stateB={isCompareMode ? stateB : undefined} 
        isCompareMode={isCompareMode}
        master={masterData}
      />

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal 
          masterData={masterData} 
          onSave={saveMasterData} 
          onClose={() => setShowSettings(false)}
          onReset={resetToDefault}
        />
      )}
    </div>
  );
}

// Settings Component
const SettingsModal: React.FC<{
  masterData: AppMasterData;
  onSave: (d: AppMasterData) => void;
  onClose: () => void;
  onReset: () => void;
}> = ({ masterData, onSave, onClose, onReset }) => {
  const [data, setData] = useState<AppMasterData>(JSON.parse(JSON.stringify(masterData)));
  
  const updatePlanName = (id: string, name: string) => {
    setData({
      ...data,
      plans: data.plans.map(p => p.id === id ? { ...p, name } : p)
    });
  };

  const updateCapacityPrice = (planId: string, capIndex: number, price: string) => {
    const val = parseInt(price) || 0;
    setData({
      ...data,
      plans: data.plans.map(p => p.id === planId ? {
        ...p,
        capacities: p.capacities.map((c, i) => i === capIndex ? { ...c, price: val } : c)
      } : p)
    });
  };

  const updateDiscount = (planId: string, discountId: string, amount: string) => {
    const val = parseInt(amount) || 0;
    setData({
      ...data,
      discountAmounts: {
        ...data.discountAmounts,
        [planId]: {
          ...(data.discountAmounts[planId as PlanId] || {}),
          [discountId]: val
        }
      }
    });
  };

  const deleteSavedDevice = (id: string) => {
    if (confirm('この保存済み端末を削除しますか？')) {
      setData({
        ...data,
        savedDevices: data.savedDevices.filter(d => d.id !== id)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:p-6 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50/80">
          <h2 className="font-black text-xl flex items-center gap-2 text-gray-800 tracking-tight">
            <Settings className="w-6 h-6 text-primary" /> マスタ詳細設定
          </h2>
          <div className="flex gap-2">
            <button onClick={onReset} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="初期設定に戻す">
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-12 no-scrollbar">
          
          {/* Saved Devices Section */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
             <h4 className="text-[11px] font-black text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> 保存済み端末管理
             </h4>
             {data.savedDevices.length === 0 ? (
               <div className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">保存された端末はありません</div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                 {data.savedDevices.map(device => (
                   <div key={device.id} className="flex items-center justify-between bg-orange-50/50 border border-orange-100 p-3 rounded-xl">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Smartphone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-gray-700 truncate">{device.name}</span>
                      </div>
                      <button 
                        onClick={() => deleteSavedDevice(device.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </section>

          {data.plans.map(plan => (
            <div key={plan.id} className="space-y-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-gray-800 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter">ID: {plan.id}</span>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">表示名</label>
                  <input 
                    className="w-full text-lg font-black border-b-2 border-gray-200 focus:border-primary outline-none py-1 bg-transparent transition-colors"
                    value={plan.name}
                    onChange={(e) => updatePlanName(plan.id, e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Capacities */}
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 容量・基本価格
                  </h4>
                  <div className="space-y-2.5">
                    {plan.capacities.map((cap, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
                        <span className="text-xs font-bold text-gray-600">{cap.label}</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            className="w-24 text-right border-b border-gray-300 focus:border-primary outline-none bg-transparent font-black text-gray-800"
                            value={cap.price}
                            onChange={(e) => updateCapacityPrice(plan.id, i, e.target.value)}
                          />
                          <span className="text-[11px] font-bold text-gray-400">円</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discounts for this plan */}
                <div>
                  <h4 className="text-[11px] font-black text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 割引設定
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {plan.allowedDiscounts.map(dId => {
                      const discountMaster = DISCOUNTS.find(m => m.id === dId);
                      return (
                        <div key={dId} className="flex items-center justify-between text-[11px] border border-gray-50 bg-white p-3 rounded-xl shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-bold">{discountMaster?.name || dId}</span>
                            <span className="text-[9px] text-gray-400 font-mono">{dId}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                            <input 
                              type="number"
                              className="w-20 text-right outline-none text-primary font-black bg-transparent"
                              value={data.discountAmounts[plan.id]?.[dId] || 0}
                              onChange={(e) => updateDiscount(plan.id, dId, e.target.value)}
                            />
                            <span className="text-gray-400 font-bold">円</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-gray-50/80 flex flex-col sm:flex-row justify-end items-center gap-4">
          <span className="text-[10px] text-gray-400 flex-1 text-center sm:text-left">※ 保存したデータはブラウザの保存領域（LocalStorage）に記録されます。</span>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
            >
              キャンセル
            </button>
            <button 
              onClick={() => onSave(data)}
              className="flex-1 sm:flex-none px-10 py-3 bg-primary text-white text-sm font-black rounded-full shadow-lg shadow-red-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> 設定を適用する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
