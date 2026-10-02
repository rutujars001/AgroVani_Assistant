import React, { useState } from 'react';
import {
  ArrowLeft,
  FlaskConical,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  FileText,
  Sliders,
  Award,
  Layers
} from 'lucide-react';
import { soilHealthService } from '../../services/soilHealthService';
import { SoilHealthCard, FarmerProfile } from '../../types';
import { speechService } from '../../services/speechService';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface SoilHealthModuleProps {
  profile: FarmerProfile;
  onBack: () => void;
}

export const SoilHealthModule: React.FC<SoilHealthModuleProps> = ({ profile, onBack }) => {
  const [soilCard, setSoilCard] = useState<SoilHealthCard>(soilHealthService.getSoilCard());
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Form states for test simulation
  const [inputPh, setInputPh] = useState(soilCard.ph.toString());
  const [inputOc, setInputOc] = useState(soilCard.organicCarbon.toString());
  const [inputN, setInputN] = useState(soilCard.availableN.toString());
  const [inputP, setInputP] = useState(soilCard.availableP.toString());
  const [inputK, setInputK] = useState(soilCard.availableK.toString());

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    speechService.hapticFeedback(30);
    const updated = soilHealthService.calculateSoilPrescriptions(
      parseFloat(inputPh) || 8.0,
      parseFloat(inputOc) || 0.45,
      parseFloat(inputN) || 190,
      parseFloat(inputP) || 15,
      parseFloat(inputK) || 400
    );
    setSoilCard(updated);
    setIsTestModalOpen(false);
  };

  const handlePlayAdvisory = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    speechService.speak(soilCard.audioAdvisory);
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
            <h2 className="text-base font-extrabold">डिजिटल माती परीक्षण कार्ड</h2>
            <p className="text-xs text-emerald-200">सॉईल हेल्थ कार्ड व स्मार्ट खत प्रिस्क्रिप्शन</p>
          </div>
        </div>

        <button
          onClick={handlePlayAdvisory}
          className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-900 px-2.5 py-1 rounded-xl text-emerald-200 text-xs font-bold border border-emerald-600/50 cursor-pointer shadow-2xs"
          title="सल्ला ऐका"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span>सल्ला ऐका</span>
        </button>
      </div>

      {/* Official Soil Card Banner */}
      <div className="bg-white rounded-3xl border-2 border-emerald-300 p-4 shadow-sm mb-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-stone-900">
                मृद आरोग्य पत्रिका (Soil Health Card)
              </div>
              <div className="text-[10px] text-stone-500">
                नमुना क्र: {soilCard.sampleNumber} • {soilCard.testedDate}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-stone-400 block">आरोग्य स्कोअर</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {soilCard.overallHealthScore}/१००
            </span>
          </div>
        </div>

        {/* Farmer & Soil Metadata */}
        <div className="mt-2.5 p-2 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-600 flex items-center justify-between">
          <div>
            शेतकरी: <strong>{profile.fullName || 'तुकाराम शिंदे'}</strong> • {profile.village}, {profile.taluka}
          </div>
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-300 cursor-pointer"
          >
            व्हॅल्यू बदला
          </button>
        </div>

        {/* Key Soil Parameters Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {/* pH */}
          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
            <span className="text-[10px] text-amber-800 font-bold block">सामू (pH)</span>
            <span className="text-base font-extrabold text-amber-950 block mt-0.5">
              {soilCard.ph}
            </span>
            <span className="text-[9px] text-amber-800 font-bold line-clamp-1">
              {soilCard.phStatus.split(' ')[0]}
            </span>
          </div>

          {/* Organic Carbon */}
          <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[10px] text-stone-600 font-bold block">सेंद्रिय कर्ब (OC)</span>
            <span className="text-base font-extrabold text-stone-900 block mt-0.5">
              {soilCard.organicCarbon}%
            </span>
            <span className="text-[9px] text-rose-600 font-bold">
              {soilCard.ocStatus} (वाढवणे गरजेचे)
            </span>
          </div>

          {/* Lime / Calcium */}
          <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-[10px] text-stone-600 font-bold block">चुनखडी प्रमाण</span>
            <span className="text-base font-extrabold text-stone-900 block mt-0.5">
              {soilCard.calciumCarbonate}%
            </span>
            <span className="text-[9px] text-amber-700 font-bold">
              मध्यम ते जास्त
            </span>
          </div>

          {/* Available Nitrogen (N) */}
          <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-[10px] text-rose-800 font-bold block">उपलब्ध नत्र (N)</span>
            <span className="text-sm font-extrabold text-rose-950 block mt-0.5">
              {soilCard.availableN} kg/ha
            </span>
            <span className="text-[9px] text-rose-700 font-bold">
              कमी (युरिया विभागून द्या)
            </span>
          </div>

          {/* Available Phosphorus (P) */}
          <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
            <span className="text-[10px] text-sky-800 font-bold block">उपलब्ध स्फुरद (P)</span>
            <span className="text-sm font-extrabold text-sky-950 block mt-0.5">
              {soilCard.availableP} kg/ha
            </span>
            <span className="text-[9px] text-sky-700 font-bold">
              मध्यम (विद्राव्य वापरा)
            </span>
          </div>

          {/* Available Potassium (K) */}
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] text-emerald-800 font-bold block">उपलब्ध पालाश (K)</span>
            <span className="text-sm font-extrabold text-emerald-950 block mt-0.5">
              {soilCard.availableK} kg/ha
            </span>
            <span className="text-[9px] text-emerald-800 font-extrabold">
              भरपूर (पोटॅश बचत करा)
            </span>
          </div>
        </div>
      </div>

      {/* Smart Fertilizer Prescription List (The ₹4,000-6,000 saving feature) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm mb-3 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="text-xs font-extrabold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>स्मार्ट खत प्रिस्क्रिप्शन (Fertilizer Prescription)</span>
            </h3>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
              मातीतील घटकांनुसार खतांची बचत व उत्पादन वाढ शिफारस
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {soilCard.prescriptions.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900">
                  {item.fertilizerName}
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  {item.savingEstimate}
                </span>
              </div>

              <div className="text-xs text-emerald-900 font-bold">
                मात्रा: <span className="text-stone-800 font-medium">{item.quantityPerAcre}</span>
              </div>

              <div className="text-[11px] text-stone-600 leading-relaxed">
                <strong>कारण व फायदा: </strong>{item.reason}
              </div>

              <div className="text-[10px] text-stone-400">
                वेळ: {item.timing}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solapur Soil Advisory Footer */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs space-y-1.5 mb-3">
        <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>सोलापूर काळ्या व चुनखडीयुक्त जमिनीसाठी विशेष सल्ला:</span>
        </div>
        <p className="text-[11px] text-emerald-900 leading-relaxed">
          सोलापूर पट्ट्यातील जमिनीत निसर्गतः पालाश भरपूर असतो. त्यामुळे दुकानदारांच्या सांगण्यावरून जास्त पोटॅश (MOP) खत विकत घेऊ नका. चुनखडीमुळे स्फुरद लॉक होतो, म्हणून फॉस्फोरिक ॲसिड किंवा १२:६१:०० ठिबकद्वारे द्या.
        </p>
      </div>

      {/* Step-by-Step Practical Soil Sampling Guide (शेतकऱ्यांसाठी प्रत्यक्ष कृती) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm mb-3 space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-extrabold text-stone-900">
              मातीचा नमुना घेण्याची शास्त्रोक्त पद्धत
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              speechService.stopSpeaking();
              speechService.hapticFeedback(25);
              speechService.speak('मातीचा नमुना घेण्यासाठी शेतात झिगझॅग पद्धतीने १० ते १२ जागा निवडा. पंधरा ते वीस सेंटीमीटर खोल व्ही आकाराचा खड्डा करून कडेची दोन सेंटीमीटर माती गोळा करा. सर्व माती सावलीत सुकवून अर्धा किलो नमुना कापडी पिशवीत भरा.');
            }}
            className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer"
            title="मार्गदर्शन ऐका"
          >
            <Volume2 className="w-3 h-3" />
            <span>पद्धत ऐका</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-extrabold text-emerald-800 block text-[11px]">१. जागा निवड</span>
            <p className="text-[10px] text-stone-600 mt-0.5">
              शेतात झिग-झॅग चाला. झाडांखालील व खतांच्या ढिगाऱ्याकडील जागा सोडून १० ते १५ ठिकाणे निवडा.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-extrabold text-emerald-800 block text-[11px]">२. 'V' आकाराचा खड्डा</span>
            <p className="text-[10px] text-stone-600 mt-0.5">
              खुरप्याने १५ ते २० सें.मी. (९ इंच) खोल इंग्रजी 'V' आकाराचा खड्डा तयार करा.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-extrabold text-emerald-800 block text-[11px]">३. कडेची माती गोळा करा</span>
            <p className="text-[10px] text-stone-600 mt-0.5">
              खड्ड्याच्या बाजूची २ सें.मी. जाडीची मातीची चकती वरपासून तळापर्यंत खरवडून बादलीत टाका.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-extrabold text-emerald-800 block text-[11px]">४. १/२ किलो नमुना</span>
            <p className="text-[10px] text-stone-600 mt-0.5">
              सर्व माती एकत्र मिसळा, सावलीत सुकवा आणि चार भाग करून शेवटी १/२ किलो नमुना पिशवीत भरा.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Soil Test Values Input */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRecalculate}
            className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-emerald-400 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-extrabold text-stone-900">
                माती चाचणी आकडे प्रविष्ट करा
              </h4>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              आपल्या सॉईल हेल्थ कार्डवरील लॅब रिझल्ट टाका, त्यानुसार प्रिस्क्रिप्शन आपोआप तयार होईल:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-0.5">सामू (pH):</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputPh}
                  onChange={(e) => setInputPh(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-0.5">सेंद्रिय कर्ब (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputOc}
                  onChange={(e) => setInputOc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-0.5">उपलब्ध नत्र (N):</label>
                <input
                  type="number"
                  value={inputN}
                  onChange={(e) => setInputN(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-0.5">उपलब्ध स्फुरद (P):</label>
                <input
                  type="number"
                  value={inputP}
                  onChange={(e) => setInputP(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-stone-700 block mb-0.5">उपलब्ध पालाश (K):</label>
                <input
                  type="number"
                  value={inputK}
                  onChange={(e) => setInputK(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-xs active:scale-95"
              >
                विश्लेषण करा
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
