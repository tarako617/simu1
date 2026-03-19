import React, { useEffect, useRef, useState } from 'react';
import { SimulationState, CalculationResult, AppMasterData } from '../types';
import { calculateTotal } from '../utils/calculator';
import { DISCOUNTS } from '../constants';
import { X, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface Props {
  stateA: SimulationState;
  stateB?: SimulationState;
  isCompareMode: boolean;
  master: AppMasterData;
  onClose: () => void;
}

export const ExportPreviewModal: React.FC<Props> = ({ stateA, stateB, isCompareMode, master, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  const resA = calculateTotal(stateA, master);
  const resB = stateB ? calculateTotal(stateB, master) : null;
  const planAName = master.plans.find(p => p.id === stateA.planId)?.name;
  const planBName = stateB ? master.plans.find(p => p.id === stateB.planId)?.name : null;

  useEffect(() => {
    // Generate image after a short delay to ensure fonts/styles are loaded
    const timer = setTimeout(() => {
      if (receiptRef.current) {
        toPng(receiptRef.current, { cacheBust: true, pixelRatio: 2 })
          .then((dataUrl) => {
            setDataUrl(dataUrl);
            setIsGenerating(false);
          })
          .catch((err) => {
            console.error('Failed to generate image', err);
            setIsGenerating(false);
          });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-black text-gray-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            画像として保存
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-100">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-gray-500 py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-bold">画像を生成中...</p>
            </div>
          ) : dataUrl ? (
            <div className="w-full flex flex-col items-center gap-4">
              <p className="text-xs font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                👇 画像を長押しして保存してください
              </p>
              <img src={dataUrl} alt="シミュレーション結果" className="w-full h-auto rounded-xl shadow-md border border-gray-200" />
            </div>
          ) : (
            <p className="text-sm text-red-500 font-bold">画像の生成に失敗しました。</p>
          )}
        </div>
      </div>

      {/* Hidden element for rendering the receipt */}
      <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0">
        <div ref={receiptRef} className="bg-white w-[600px] p-8 font-sans text-gray-800">
          <div className="flex items-center gap-2 mb-6 border-b-4 border-primary pb-4">
            <div className="w-3 h-10 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter">料金シミュレーション結果</h1>
          </div>

          <div className={`grid ${isCompareMode ? 'grid-cols-2 gap-8' : 'grid-cols-1 max-w-sm mx-auto'}`}>
            <ReceiptColumn result={resA} planName={planAName} isProRated={stateA.isProRated} />
            {isCompareMode && resB && (
              <ReceiptColumn result={resB} planName={planBName} isB isProRated={stateB?.isProRated} />
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 text-gray-400 text-xs text-center font-bold">
            ※表示金額は税込目安です。実際の請求額とは異なる場合があります。
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptColumn: React.FC<{ result: CalculationResult; planName?: string; isB?: boolean; isProRated?: boolean }> = ({ result, planName, isB, isProRated }) => (
  <div className="space-y-3 text-sm bg-gray-50 p-6 rounded-2xl border border-gray-200">
    <h4 className={`text-xl font-black border-b-2 pb-2 mb-4 ${isB ? 'text-blue-600 border-blue-200' : 'text-primary border-red-200'}`}>
      {planName || 'プラン'}
    </h4>
    
    <div className="flex justify-between items-end mb-6">
      <span className="text-gray-600 font-bold">月額目安</span>
      <span className={`text-4xl font-black ${isB ? 'text-blue-600' : 'text-primary'}`}>
        {result.totalMonthly.toLocaleString()}<span className="text-base font-medium text-gray-500 ml-1">円</span>
      </span>
    </div>

    <Row label="基本料金" val={result.basePrice} />
    <Row label="通話オプション" val={result.voicePrice} />
    {result.docomoMailPrice > 0 && <Row label="メール持ち運び" val={result.docomoMailPrice} />}
    
    {result.discountTotal > 0 && (
      <div className="py-2">
        <div className="flex justify-between text-green-600 font-bold">
          <span>割引合計</span>
          <span>-{result.discountTotal.toLocaleString()}円</span>
        </div>
        {result.discountDetails.map((d, i) => {
           const dName = DISCOUNTS.find(master => master.id === d.name)?.name || d.name;
           return (
            <div key={i} className="flex justify-between text-gray-500 pl-2 text-xs mt-1">
              <span>{dName}</span>
              <span>-{d.amount.toLocaleString()}円</span>
            </div>
           );
        })}
      </div>
    )}

    <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
    <div className="flex justify-between items-center font-black text-gray-700 text-base">
      <span>プラン料金計</span>
      <span>{result.planSubtotal.toLocaleString()}円</span>
    </div>
    <div className="mb-4"></div>

    <Row label="端末代(月額)" val={result.deviceMonthly} />

    <div className="border-t-2 border-gray-300 pt-4 mt-4">
       <div className="font-black text-gray-700 mb-2">初期費用内訳</div>
       <Row label="事務手数料" val={result.adminFee} />
       <Row label={(isProRated ?? true) ? "プラン利用料(日割)" : "プラン利用料(満額)"} val={result.proRatedUsageOnly} />
       {result.deviceFirstMonth > 0 && <Row label="端末初回支払" val={result.deviceFirstMonth} />}
       <div className="border-t-2 border-dashed border-gray-300 my-3"></div>
       <Row label="初期費用合計" val={result.proRatedInitialTotal} highlight />
    </div>
  </div>
);

const Row: React.FC<{ label: string; val: number; highlight?: boolean }> = ({ label, val, highlight }) => (
  <div className={`flex justify-between items-center py-1 ${highlight ? 'font-black text-gray-800 text-lg' : 'text-gray-600 font-bold'}`}>
    <span>{label}</span>
    <span>{val.toLocaleString()}円</span>
  </div>
);
