import React from 'react';
import { ArrowLeft, Sprout, AlertTriangle, CheckCircle2, Stethoscope, FileDown, Calendar, ShieldCheck, Plus, Sparkles, MapPin } from 'lucide-react';
import { FarmerProfile, PlantixDiseaseDiagnosis } from '../../types';
import { generateAndDownloadReportPDF } from '../../services/pdfReportService';
import { speechService } from '../../services/speechService';
import { AudioPlayerButton } from '../AudioPlayerButton';

interface MyFarmModuleProps {
  profile: FarmerProfile;
  onBack: () => void;
  onStartDoctorCheck: (crop: string) => void;
  onOpenAuth: () => void;
}

export const MyFarmModule: React.FC<MyFarmModuleProps> = ({
  profile,
  onBack,
  onStartDoctorCheck,
  onOpenAuth
}) => {
  const crops = profile.selectedPrimaryCrops || ['ज्वारी', 'कांदा', 'डाळिंब'];
  const stages = profile.cropGrowthStages || [];

  const handleDownloadHistoricalReport = (diag: PlantixDiseaseDiagnosis) => {
    speechService.hapticFeedback(40);
    generateAndDownloadReportPDF(diag, profile);
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
            <h2 className="text-base font-extrabold">माझे शेत (My Farm)</h2>
            <p className="text-xs text-emerald-200">प्लॅन्टिक्स वैयक्तिक पीक सल्ला व आरोग्य ट्रॅकर</p>
          </div>
        </div>
        <button
          onClick={onOpenAuth}
          className="text-[11px] font-bold bg-emerald-900/80 hover:bg-emerald-900 px-2.5 py-1 rounded-xl text-emerald-200 border border-emerald-600/50"
        >
          प्रोफाइल बदला
        </button>
      </div>

      {/* Farmer Identity Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-stone-900">{profile.fullName || 'शेतकरी मित्र'}</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>सत्यापित</span>
            </span>
          </div>
          <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{profile.village}, ता. {profile.taluka}, सोलापूर • <strong>{profile.landAreaAcre} एकर</strong></span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block">सिंचन सोय</span>
          <span className="text-xs font-bold text-stone-700">{profile.irrigationType || 'ठिबक सिंचन'}</span>
        </div>
      </div>

      {/* Crop Calendar Shortcut Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-3 shadow-xs mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold">दैनिक पीक दिनदर्शिका (Crop Calendar)</div>
            <div className="text-[10px] text-emerald-200">पिकांच्या वाढीच्या टप्प्यानुसार दैनिक कामांचे नियोजन</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-[11px] font-bold bg-white text-emerald-900 hover:bg-emerald-100 px-2.5 py-1 rounded-xl cursor-pointer active:scale-95 shadow-2xs"
        >
          कामे पहा
        </button>
      </div>

      {/* Plantix-style Personalized Crops List */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wide">
            माझी चालू पिके ({crops.length})
          </h3>
          <span className="text-[11px] text-emerald-800 font-bold">प्लॅन्टिक्स पीक सल्ला</span>
        </div>

        {crops.map((cropName) => {
          const stageInfo = stages.find(s => s.cropName === cropName);
          const isDalimb = cropName === 'डाळिंब';
          const isKanda = cropName === 'कांदा';

          return (
            <div key={cropName} className="bg-white rounded-2xl border-2 border-stone-200 p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {isDalimb ? '🍎' : isKanda ? '🧅' : cropName === 'ऊस' ? '🎋' : '🌾'}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-stone-900">{cropName}</h4>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-md font-bold">
                        {isDalimb ? '२.० एकर' : isKanda ? '१.० एकर' : '०.५ एकर'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500">
                      {stageInfo?.stage || 'वाढ व विकास टप्पा (४५ दिवस)'} • {isDalimb ? 'भगवा वाण' : isKanda ? 'भीमा सुपर' : 'को ८६०३२'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>आरोग्य उत्तम</span>
                </span>
              </div>

              {/* Personalized Disease Risk Notification */}
              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-950">
                  <strong>सोलापूर हवामान जोखीम सूचना: </strong>
                  {isDalimb && 'सध्या सोलापूरमध्ये तापमान ३७ अंश व कोरडे वारे असल्याने डाळिंबावर तेल्या व फळ तडकण्याचा धोका मध्यम आहे. संध्याकाळी मोजून पाणी द्या.'}
                  {isKanda && 'कांदा पोसण्याच्या टप्प्यात आहे. करपा रोगाची लक्षणे दिसल्यास तातडीने ५% निंबोळी अर्क किंवा डायफेनकोनाझोल फवारा.'}
                  {!isDalimb && !isKanda && `${cropName} पिकावर किडींच्या प्रादुर्भावासाठी पिवळे चिकट सापळे लावावेत.`}
                </div>
              </div>

              {/* Action Button: Check with Doctor */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">पानावर काही रोग दिसतोय का?</span>
                <button
                  onClick={() => {
                    speechService.hapticFeedback(40);
                    onStartDoctorCheck(cropName);
                  }}
                  className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer shadow-xs active:scale-95 transition"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>कृषी डॉक्टरकडे तपासा</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Health Reports & PDF Downloads (Plantix style) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-stone-100">
          <h3 className="text-xs font-extrabold text-stone-800">
            मागील रोग तपासण्या व औषध अहवाल (Health Reports)
          </h3>
          <span className="text-[10px] text-stone-400">PDF उपलब्ध</span>
        </div>

        {profile.diagnosisHistory && profile.diagnosisHistory.length > 0 ? (
          <div className="space-y-2">
            {profile.diagnosisHistory.map((diag) => (
              <div key={diag.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-stone-900">{diag.diseaseNameMr} ({diag.crop})</div>
                  <div className="text-[10px] text-stone-500">{diag.timestamp} • {diag.confidenceScore}% अचूकता</div>
                </div>
                <button
                  onClick={() => handleDownloadHistoricalReport(diag)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg cursor-pointer transition active:scale-95"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF अहवाल</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-stone-500">
            अद्याप कोणताही रोग अहवाल साठवलेला नाही. कृषी डॉक्टरकडून पानाचा फोटो काढून पहिले मोफत निदान करा.
          </div>
        )}
      </div>
    </div>
  );
};
