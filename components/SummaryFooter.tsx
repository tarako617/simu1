
import React, { useState } from 'react';
import { SimulationState, CalculationResult, AppMasterData } from '../types';
import { calculateTotal } from '../utils/calculator';
import { DISCOUNTS } from '../constants';
import { ChevronUp, ChevronDown, Info, Image as ImageIcon } from 'lucide-react';
import { ExportPreviewModal } from './ExportPreviewModal';

interface Props {
  stateA: SimulationState;
  stateB?: SimulationState;
  isCompareMode: boolean;
  master: AppMasterData;
}

export const SummaryFooter: React.FC<Props> = ({ stateA, stateB, isCompareMode, master }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const resA = calculateTotal(stateA, master);
  const resB = stateB ? calculateTotal(stateB, master) : null;

  const planAName = master.plans.find(p => p.id === stateA.planId)?.name;
  const planBName = stateB ? master.plans.find(p => p.id === stateB.planId)?.name : null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 pb-safe-bottom">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center pt-2 pb-1 text-gray-400 hover:text-gray-600"
        >
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        <div className="px-4 pb-3">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
               {isCompareMode && <div className="text-[10px] text-gray-500 font-bold mb-1">プランA: {planAName}</div>}
               <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600 font-bold">月額目安</span>
                  <span className="text-2xl font-black text-primary">
                    {resA.totalMonthly.toLocaleString()}<span className="text-sm font-medium text-gray-500">円</span>
                  </span>
               </div>
            </div>

            {isCompareMode && resB && (
              <>
                <div className="w-px h-10 bg-gray-200 self-center"></div>
                <div className="flex-1">
                  <div className="text-[10px] text-gray-500 font-bold mb-1">プランB: {planBName}</div>
                  <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gray-600 font-bold">月額目安</span>
                      <span className="text-2xl font-black text-blue-600">
                        {resB.totalMonthly.toLocaleString()}<span className="text-sm font-medium text-gray-500">円</span>
                      </span>
                  </div>
                </div>
              </>
            )}
            
            {/* Export Button */}
            <div className="flex items-center justify-center pl-2 border-l border-gray-100">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex flex-col items-center justify-center p-2 text-gray-400 hover:text-primary transition-colors rounded-xl hover:bg-red-50"
                title="画像として保存"
              >
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-[9px] font-bold">画像保存</span>
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 max-h-[60vh] overflow-y-auto no-scrollbar">
            <div className={`grid ${isCompareMode ? 'grid-cols-2 gap-4' : 'grid-cols-1'} mt-4`}>
               <DetailColumn result={resA} planName={planAName} isProRated={stateA.isProRated} />
               {isCompareMode && resB && (
                 <DetailColumn result={resB} planName={planBName} isB isProRated={stateB?.isProRated} />
               )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-[10px] text-blue-800 space-y-1">
               <p className="font-bold flex items-center gap-1"><Info className="w-3 h-3"/> 注意事項</p>
               <p>・表示金額は税込目安です。事務手数料は日割りされません。</p>
               <p>・初期費用には「事務手数料」「プラン日割り(または満額)」「端末初回支払」が含まれます。</p>
            </div>
          </div>
        )}
      </div>

      {showExportModal && (
        <ExportPreviewModal 
          stateA={stateA}
          stateB={stateB}
          isCompareMode={isCompareMode}
          master={master}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
};

const DetailColumn: React.FC<{ result: CalculationResult; planName?: string; isB?: boolean; isProRated?: boolean }> = ({ result, planName, isB, isProRated }) => (
  <div className="space-y-2 text-xs">
    <h4 className={`font-bold border-b pb-1 ${isB ? 'text-blue-600 border-blue-200' : 'text-primary border-red-200'}`}>
      {planName || 'プラン'}
    </h4>
    
    <Row label="基本料金" val={result.basePrice} />
    <Row label="通話OP" val={result.voicePrice} />
    {result.docomoMailPrice > 0 && <Row label="メール持ち運び" val={result.docomoMailPrice} />}
    
    {result.discountTotal > 0 && (
      <div className="py-1">
        <div className="flex justify-between text-green-600 font-bold">
          <span>割引合計</span>
          <span>-{result.discountTotal.toLocaleString()}円</span>
        </div>
        {result.discountDetails.map((d, i) => {
           const dName = DISCOUNTS.find(master => master.id === d.name)?.name || d.name;
           return (
            <div key={i} className="flex justify-between text-gray-400 pl-2 text-[10px]">
              <span>{dName}</span>
              <span>-{d.amount.toLocaleString()}</span>
            </div>
           );
        })}
      </div>
    )}

    {/* プラン料金小計 */}
    <div className="border-t border-dashed my-1"></div>
    <div className="flex justify-between items-center font-black text-gray-700">
      <span>プラン計</span>
      <span>{result.planSubtotal.toLocaleString()}円</span>
    </div>
    <div className="mb-2"></div>

    <Row label="端末代(月額)" val={result.deviceMonthly} />

    <div className="border-t border-gray-300 pt-2 mt-2">
       <div className="font-bold text-gray-700 mb-1">初期費用内訳</div>
       <Row label="事務手数料" val={result.adminFee} />
       {/* isProRatedがundefinedの場合はtrue(日割)扱いとする */}
       <Row label={(isProRated ?? true) ? "プラン利用料(日割)" : "プラン利用料(満額)"} val={result.proRatedUsageOnly} />
       {result.deviceFirstMonth > 0 && <Row label="端末初回支払" val={result.deviceFirstMonth} />}
       <div className="border-t border-dashed my-1"></div>
       <Row label="初期費用合計" val={result.proRatedInitialTotal} highlight />
    </div>
  </div>
);

const Row: React.FC<{ label: string; val: number; highlight?: boolean }> = ({ label, val, highlight }) => (
  <div className={`flex justify-between items-center ${highlight ? 'font-bold text-gray-800 text-sm' : 'text-gray-600'}`}>
    <span>{label}</span>
    <span>{val.toLocaleString()}円</span>
  </div>
);
