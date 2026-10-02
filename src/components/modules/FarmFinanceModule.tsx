import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Mic,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  PieChart,
  Calendar,
  Volume2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Tag,
  FileSpreadsheet
} from 'lucide-react';
import { farmFinanceService } from '../../services/farmFinanceService';
import { FarmTransaction, FarmerProfile } from '../../types';
import { speechService } from '../../services/speechService';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface FarmFinanceModuleProps {
  profile: FarmerProfile;
  onBack: () => void;
  onOpenVoice?: () => void;
}

export const FarmFinanceModule: React.FC<FarmFinanceModuleProps> = ({ profile, onBack }) => {
  const [transactions, setTransactions] = useState<FarmTransaction[]>([]);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  // Form states
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [formCrop, setFormCrop] = useState<string>('कांदा');
  const [formCategory, setFormCategory] = useState<FarmTransaction['category']>('खते');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');

  const reloadData = () => {
    setTransactions(farmFinanceService.getTransactions());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const stats = farmFinanceService.getFinancialSummary(selectedCropFilter);
  const primaryCrops = profile.selectedPrimaryCrops?.length ? profile.selectedPrimaryCrops : ['कांदा', 'डाळिंब', 'ऊस', 'ज्वारी'];

  const handleStartVoiceLogging = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('आपल्या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही.');
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = 'mr-IN';
    rec.continuous = false;
    rec.interimResults = false;

    setIsVoiceRecording(true);
    setVoiceNotice('ऐकत आहे... बोला (उदा. "काल डीएपी खत आणले १३५० रुपये")');

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setIsVoiceRecording(false);
      setVoiceNotice(`नोंदवले: "${transcript}"`);

      const parsedList = farmFinanceService.parseMultipleSpokenExpenses(transcript);
      if (parsedList.length > 0) {
        parsedList.forEach((parsed) => {
          farmFinanceService.addTransaction(parsed as any);
        });
        reloadData();
        const spokenMsg = parsedList.length > 1
          ? `एकूण ${parsedList.length} नोंदी यशस्वीरीत्या जमा झाल्या आहेत.`
          : `नोंद झाली आहे: ${parsedList[0].crop} साठी ${parsedList[0].amount} रुपये.`;
        speechService.speak(spokenMsg);
      }
    };

    rec.onerror = () => {
      setIsVoiceRecording(false);
      setVoiceNotice('आवाज ओळखता आला नाही. पुन्हा प्रयत्न करा.');
    };

    rec.onend = () => {
      setIsVoiceRecording(false);
    };

    rec.start();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (!amt || amt <= 0) return;

    speechService.hapticFeedback(30);
    const todayStr = new Date().toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    farmFinanceService.addTransaction({
      date: todayStr,
      type: formType,
      crop: formCrop,
      category: formType === 'income' ? 'उत्पन्न / विक्री' : formCategory,
      amount: amt,
      note: formNote || `${formCrop} ${formCategory}`
    });

    setFormAmount('');
    setFormNote('');
    setIsAddModalOpen(false);
    reloadData();
  };

  const handleDelete = (id: string) => {
    speechService.hapticFeedback(25);
    farmFinanceService.deleteTransaction(id);
    reloadData();
  };

  const handlePlayFinancialSummary = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    const speech = `आपला एकूण शेती खर्च ${stats.totalExpense} रुपये असून, एकूण उत्पन्न ${stats.totalIncome} रुपये आहे. निव्वळ नफा ${stats.netProfit} रुपये शिल्लक आहे.`;
    speechService.speak(speech);
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-12 overflow-y-auto">
      {/* Header */}
      <div className="bg-emerald-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-emerald-700 cursor-pointer text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold">शेतकरी जमा-खर्च वही</h2>
            <p className="text-xs text-emerald-200">व्हॉइस शेती हिशोब व नफा-तोटा ट्रॅकर</p>
          </div>
        </div>

        <button
          onClick={handlePlayFinancialSummary}
          className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-900 px-2.5 py-1 rounded-xl text-emerald-200 text-xs font-bold border border-emerald-600/50 cursor-pointer shadow-2xs"
          title="हिशोब ऐका"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span>हिशोब ऐका</span>
        </button>
      </div>

      {/* Voice Input Action Card */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-4 text-white shadow-sm mb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-extrabold">बोलून हिशोब नोंदवा</h3>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              उदा. "काल खताचे २ पोती आणली २४०० रुपये"
            </p>
          </div>

          <button
            onClick={handleStartVoiceLogging}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer shadow-md transition active:scale-95 ${
              isVoiceRecording ? 'bg-rose-500 animate-pulse text-white' : 'bg-white text-emerald-800 hover:bg-emerald-50'
            }`}
            title="बोलून नोंद करा"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>

        {voiceNotice && (
          <div className="mt-2.5 p-2 bg-black/20 rounded-xl text-xs text-emerald-100 font-bold">
            {voiceNotice}
          </div>
        )}

        {/* Quick 1-Tap Preset Expense Chips (Useful in noisy fields / tractors) */}
        <div className="mt-3 pt-2.5 border-t border-emerald-600/50">
          <span className="text-[10px] text-emerald-200 font-bold block mb-1.5">
            १-टॅप जलद नोंदी (आवाजाचा गोंधळ असल्यास):
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: '🌾 डीएपी खत ₹१,३५०', crop: 'कांदा', cat: 'खते', amt: 1350 },
              { label: '🌿 खुरपणी मजुरी ₹८००', crop: 'कांदा', cat: 'मजुरी', amt: 800 },
              { label: '🛡️ फवारणी औषध ₹१,२००', crop: 'डाळिंब', cat: 'कीटकनाशके', amt: 1200 },
              { label: '💧 विहीर डिझेल ₹५००', crop: 'ऊस', cat: 'सिंचन व डिझेल', amt: 500 },
              { label: '🚜 ट्रॅक्टर रोटावेटर ₹१,५००', crop: 'ज्वारी', cat: 'यंत्रसामग्री', amt: 1500 }
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  speechService.hapticFeedback(30);
                  const todayStr = new Date().toLocaleDateString('mr-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });
                  farmFinanceService.addTransaction({
                    date: todayStr,
                    type: 'expense',
                    crop: p.crop,
                    category: p.cat as any,
                    amount: p.amt,
                    note: p.label
                  });
                  reloadData();
                  speechService.speak(`${p.label} नोंद झाली आहे.`);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold whitespace-nowrap cursor-pointer active:scale-95 transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Total Expense */}
        <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs text-center">
          <span className="text-[10px] text-stone-500 font-bold block">एकूण खर्च</span>
          <span className="text-sm font-extrabold text-rose-600 block mt-0.5">
            ₹{stats.totalExpense.toLocaleString('en-IN')}
          </span>
          <span className="text-[9px] text-stone-400">बियाणे, खते, मजुरी</span>
        </div>

        {/* Total Income */}
        <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs text-center">
          <span className="text-[10px] text-stone-500 font-bold block">एकूण उत्पन्न</span>
          <span className="text-sm font-extrabold text-emerald-700 block mt-0.5">
            ₹{stats.totalIncome.toLocaleString('en-IN')}
          </span>
          <span className="text-[9px] text-stone-400">बाजारपेठ विक्री</span>
        </div>

        {/* Net Profit */}
        <div className={`p-2.5 rounded-2xl border shadow-2xs text-center ${
          stats.netProfit >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
        }`}>
          <span className="text-[10px] font-bold text-stone-600 block">निव्वळ नफा</span>
          <span className={`text-sm font-extrabold block mt-0.5 ${
            stats.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'
          }`}>
            ₹{stats.netProfit.toLocaleString('en-IN')}
          </span>
          <span className="text-[9px] font-bold text-stone-500">
            {stats.profitMargin}% नफा
          </span>
        </div>
      </div>

      {/* Crop Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCropFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer transition border ${
            selectedCropFilter === 'all'
              ? 'bg-emerald-800 text-white border-emerald-800'
              : 'bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          सर्व पिके
        </button>

        {primaryCrops.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCropFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition border ${
              selectedCropFilter === c
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {c}
          </button>
        ))}

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="ml-auto flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>नोंद जोडा</span>
        </button>
      </div>

      {/* Crop-wise Profit Breakdown */}
      {selectedCropFilter === 'all' && stats.cropBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-2xs mb-3 space-y-2">
          <div className="text-xs font-extrabold text-stone-800 flex items-center justify-between pb-1 border-b border-stone-100">
            <span>पीकनिहाय नफा-तोटा</span>
            <span className="text-[10px] text-stone-400">खर्च विरूद्ध उत्पन्न</span>
          </div>

          <div className="space-y-2">
            {stats.cropBreakdown.map((item) => (
              <div key={item.crop} className="text-xs flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100">
                <div className="font-extrabold text-stone-800">
                  {item.crop}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-stone-500">
                    खर्च: ₹{item.expense.toLocaleString('en-IN')} • उत्पन्न: ₹{item.income.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs font-extrabold ${item.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    निव्वळ: ₹{item.profit.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-stone-100">
          <h3 className="text-xs font-extrabold text-stone-800">
            हिशोब नोंदवही ({transactions.length})
          </h3>
          <span className="text-[10px] text-stone-400">तारीखनिहाय नोंदी</span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start justify-between p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-50 transition"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-stone-900">{tx.note}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-stone-200 text-stone-700">
                      {tx.crop}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-emerald-100 text-emerald-800">
                      {tx.category}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {tx.date}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="हटवा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-stone-500">
            कोणतीही नोंद नाही. वरील "बोलून हिशोब नोंदवा" किंवा "नोंद जोडा" बटण दाबा.
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleManualSubmit}
            className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-emerald-400 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-extrabold text-stone-900">नवीन नोंद जोडा</h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Type Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormType('expense')}
                className={`py-2 rounded-xl text-xs font-extrabold border cursor-pointer ${
                  formType === 'expense'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                खर्च (Expense)
              </button>
              <button
                type="button"
                onClick={() => setFormType('income')}
                className={`py-2 rounded-xl text-xs font-extrabold border cursor-pointer ${
                  formType === 'income'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                उत्पन्न / विक्री (Income)
              </button>
            </div>

            {/* Crop Select */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">पीक निवडा:</label>
              <select
                value={formCrop}
                onChange={(e) => setFormCrop(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
              >
                {primaryCrops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="इतर">इतर शेती कामे</option>
              </select>
            </div>

            {/* Category Select (for expense) */}
            {formType === 'expense' && (
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">खर्च प्रकार:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none"
                >
                  <option value="खते">खते (Fertilizers)</option>
                  <option value="बियाणे">बियाणे / रोपे (Seeds)</option>
                  <option value="कीटकनाशके">कीटकनाशके व फवारणी औषधे (Pesticides)</option>
                  <option value="मजुरी">मजुरी / खुरपणी (Labor)</option>
                  <option value="सिंचन व डिझेल">सिंचन, डिझेल व वीजबिल (Irrigation/Fuel)</option>
                  <option value="यंत्रसामग्री">ट्रॅक्टर व यंत्रसामग्री (Machinery)</option>
                  <option value="वाहतूक">वाहतूक खर्च (Transport)</option>
                </select>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">रक्कम (₹):</label>
              <input
                type="number"
                placeholder="उदा. १५००"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">तपशील / टीप:</label>
              <input
                type="text"
                placeholder="उदा. २ गोण्या डीएपी आणल्या"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-xs active:scale-95"
              >
                जतन करा
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
