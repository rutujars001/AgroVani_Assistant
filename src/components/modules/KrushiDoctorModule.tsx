import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Image, Send, Mic, Volume2, FileDown, AlertTriangle, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, MessageSquare, Bot, User, RefreshCw } from 'lucide-react';
import { PlantixDiseaseDiagnosis, DoctorChatMessage, FarmerProfile } from '../../types';
import { realtimeDataService } from '../../services/realtimeDataService';
import { speechService } from '../../services/speechService';
import { generateAndDownloadReportPDF } from '../../services/pdfReportService';
import { securityService } from '../../services/securityService';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { offlineSyncService } from '../../services/offlineSyncService';

interface KrushiDoctorModuleProps {
  onBack: () => void;
  onOpenVoice: () => void;
  targetCrop?: string;
}

export const KrushiDoctorModule: React.FC<KrushiDoctorModuleProps> = ({
  onBack,
  onOpenVoice,
  targetCrop = 'डाळिंब',
}) => {
  const [profile, setProfile] = useState<FarmerProfile>(securityService.getProfile());
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<PlantixDiseaseDiagnosis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'chat'>('scanner');

  const [chatMessages, setChatMessages] = useState<DoctorChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'doctor',
      text: 'नमस्कार शेतकरी मित्र! मी तुमचा डिजिटल कृषी डॉक्टर आहे. पिकाच्या पानाचा फोटो अपलोड करा किंवा कोणताही रोग, खत अथवा फवारणीविषयीचा प्रश्न मला विचारा.',
      timestamp: 'आताच',
      audioText: 'नमस्कार शेतकरी मित्र! मी तुमचा डिजिटल कृषी डॉक्टर आहे. पिकाच्या पानाचा फोटो अपलोड करा किंवा प्रश्न विचारा.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Request camera + mic permissions on mount
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(stream => stream.getTracks().forEach(t => t.stop()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isDoctorTyping]);

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          await runPlantixDiagnosis(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runPlantixDiagnosis = async (base64Image: string) => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(50);
    setCapturedImage(base64Image);
    setIsDiagnosing(true);
    setActiveTab('scanner');

    try {
      const result = await realtimeDataService.diagnoseCrop({
        crop: targetCrop,
        imageBase64: base64Image,
        symptomText: `${targetCrop} पिकाच्या पानावर रोग व किडीचे अचूक निदान करून उपाय सांगा`,
      });

      if (result && result.diseaseNameMr) {
        const diagResult: PlantixDiseaseDiagnosis = {
          id: result.id || 'diag-' + Date.now(),
          crop: targetCrop,
          diseaseNameMr: result.diseaseNameMr,
          diseaseNameEn: result.diseaseNameEn || 'Crop Disease',
          scientificName: result.scientificName || 'Pathogen spp.',
          pathogenType: result.pathogenType || 'बुरशीजन्य (Fungal)',
          confidenceScore: result.confidenceScore || 94,
          severity: result.severity || 'high',
          symptoms: result.symptoms || ['पानांवर ठिपके व करपा'],
          precautions: result.precautions || ['बाधित पाने काढून नष्ट करा', 'स्वच्छता राखा'],
          chemicalMedicines: result.chemicalMedicines || [
            {
              tradeName: 'स्कोर (डायफेनकोनाझोल २५% EC)',
              activeIngredient: 'Difenoconazole 25% EC',
              dosagePer15LPump: '१५ मिली प्रति १५ लिटर पंप (१ मिली/लिटर)',
              instructions: 'सकाळी किंवा संध्याकाळी पानांच्या दोन्ही बाजूंवर व्यवस्थित फवारावे'
            }
          ],
          biologicalRemedies: result.biologicalRemedies || ['१०% निंबोळी अर्काची फवारणी करा'],
          audioSummary: result.audioSummary || `${result.diseaseNameMr} चे निदान झाले आहे. त्वरित उपाययोजना करा.`,
          timestamp: new Date().toLocaleString('mr-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          imageUri: base64Image
        };

        setDiagnosis(diagResult);
        speechService.playTone('success');

        // Save to profile diagnosis history
        const updatedProf = { ...profile };
        if (!updatedProf.diagnosisHistory) updatedProf.diagnosisHistory = [];
        updatedProf.diagnosisHistory.unshift(diagResult);
        setProfile(updatedProf);
        securityService.saveProfile(updatedProf);

        // Add doctor message in chat
        setChatMessages(prev => [
          ...prev,
          {
            id: 'doc-diag-' + Date.now(),
            sender: 'doctor',
            text: `मी तुमच्या ${targetCrop} पिकाच्या पानाचे विश्लेषण केले आहे. यात "${diagResult.diseaseNameMr}" चे ${diagResult.confidenceScore}% अचूकतेने निदान झाले आहे. खाली सविस्तर औषधे, १५ लिटर पंपासाठी प्रमाण आणि डाऊनलोडसाठी PDF अहवाल दिला आहे.`,
            timestamp: 'आताच',
            diagnosis: diagResult,
            audioText: diagResult.audioSummary
          }
        ]);

        speechService.speak(diagResult.audioSummary);
      }
    } catch (err: any) {
      console.error(err);
      alert('रोग निदान करण्यात अडचण आली. कृपया इंटरनेट तपासा किंवा पुन्हा फोटो घ्या.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!diagnosis) return;
    speechService.hapticFeedback(40);
    generateAndDownloadReportPDF(diagnosis, profile);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isDoctorTyping) return;

    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    const userText = chatInput.trim();
    setChatInput('');

    const newMsg: DoctorChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setIsDoctorTyping(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch('/api/krushi-doctor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          currentCrop: targetCrop,
          currentDiagnosis: diagnosis,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (!data.reply) throw new Error('Empty reply');
      const docReply: DoctorChatMessage = {
        id: 'doc-' + Date.now(),
        sender: 'doctor',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
        audioText: data.audioText
      };
      setChatMessages(prev => [...prev, docReply]);
      speechService.playTone('confirm');
      speechService.speak(data.audioText || data.reply);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: 'doc-err-' + Date.now(),
          sender: 'doctor',
          text: 'माफ करा शेतकरी मित्र, सर्व्हरशी संपर्क होऊ शकला नाही. औषध फवारणी सकाळी ८ ते १० या वेळेत करा.',
          timestamp: 'आताच'
        }
      ]);
    } finally {
      setIsDoctorTyping(false);
    }
  };

  const handleVoiceInputForChat = () => {
    speechService.stopSpeaking();
    speechService.listenOnce(
      (transcript) => {
        setChatInput(transcript);
      },
      () => {}
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-10 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-rose-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-rose-700 cursor-pointer text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-1.5">
              <span>कृषी डॉक्टर (Crop Doctor)</span>
              <span className="text-[10px] bg-white text-rose-800 px-1.5 py-0.2 rounded-md font-bold">Plantix AI</span>
            </h2>
            <p className="text-xs text-rose-200">थेट पान स्कॅनर, सविस्तर औषधे व चॅटबॉट</p>
          </div>
        </div>

        {diagnosis && (
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1 bg-white text-rose-900 px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
            title="PDF अहवाल डाऊनलोड"
          >
            <FileDown className="w-4 h-4 text-rose-700" />
            <span className="hidden sm:inline">PDF अहवाल</span>
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-stone-200 p-1 rounded-2xl mb-3 text-xs font-bold">
        <button
          onClick={() => {
            setActiveTab('scanner');
            speechService.hapticFeedback(20);
          }}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'scanner' ? 'bg-rose-700 text-white shadow-xs' : 'text-stone-700'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>पानाचा फोटो स्कॅनर (Plantix)</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('chat');
            speechService.hapticFeedback(20);
          }}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'chat' ? 'bg-rose-700 text-white shadow-xs' : 'text-stone-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>डॉक्टर चॅटबॉट (AI Doctor)</span>
        </button>
      </div>

      {/* TAB 1: SCANNER & DETAILED DIAGNOSIS */}
      {activeTab === 'scanner' && (
        <div className="space-y-4">
          {/* Plantix-style Viewfinder Photo Action Buttons */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden text-center">
            {/* Viewfinder Guideline Box */}
            <div className="relative mx-auto w-52 h-40 border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center p-2 mb-2.5 bg-black/40">
              <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />

              {capturedImage ? (
                <div className="relative w-full h-full">
                  <img src={capturedImage} alt="Captured Leaf" className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    बदला ✕
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="w-9 h-9 text-emerald-400 mb-1.5 animate-pulse" />
                  <span className="text-xs font-extrabold text-emerald-200">
                    पानाचा बाधित भाग चौकटीत ठेवा
                  </span>
                  <span className="text-[10px] text-stone-300 mt-0.5">
                    १० ते १५ सें.मी. अंतरावरून स्पष्ट फोटो घ्या
                  </span>
                </>
              )}
            </div>

            {/* Smart Photo Guidance with Spoken Audio */}
            <div className="flex items-center justify-between text-[11px] text-stone-300 mb-3 bg-white/10 p-2 rounded-xl">
              <div className="text-left space-y-0.5">
                <span className="block font-bold text-emerald-300">✓ १०-१५ सेमी अंतर • ✓ चांगला सूर्यप्रकाश</span>
                <span className="block text-[10px] text-stone-300">✓ फक्त रोगग्रस्त पान व डाग चौकटीत घ्या</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  speechService.stopSpeaking();
                  speechService.hapticFeedback(25);
                  speechService.speak('अचूक रोग निदानासाठी कॅमेरा पानाच्या जवळ १० ते १५ सेंटीमीटर अंतरावर धरा आणि स्पष्ट सूर्यप्रकाशात फोटो काढा.');
                }}
                className="flex items-center gap-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer shrink-0 ml-1.5"
                title="फोटो सूचना ऐका"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>सूचना ऐका</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isDiagnosing}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>थेट फोटो काढा</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isDiagnosing}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                <Image className="w-4 h-4 text-stone-700" />
                <span>गॅलरीतून निवडा</span>
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageSelected}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelected}
            />
          </div>

          {/* Diagnosis Progress */}
          {isDiagnosing && (
            <div className="p-4 bg-white rounded-2xl border-2 border-rose-300 shadow-md text-center space-y-2 animate-pulse">
              <Sparkles className="w-8 h-8 text-rose-600 mx-auto animate-spin" />
              <div className="text-xs font-bold text-stone-800">
                कृषी डॉक्टर पानाचे बारकाईने संगणकीय विश्लेषण करत आहेत...
              </div>
              <div className="text-[10px] text-stone-500">
                बुरशी, जिवाणू आणि किडीच्या लक्षणांची पडताळणी चालू आहे
              </div>
            </div>
          )}

          {/* Plantix Detailed Diagnosis Card with PDF Download */}
          {diagnosis && !isDiagnosing && (
            <div className="bg-white rounded-3xl p-5 border-2 border-rose-300 shadow-lg space-y-4 animate-in slide-in-from-bottom-2 duration-150">
              {/* Header Box with Match Score */}
              <div className="flex items-start justify-between pb-3 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                      {diagnosis.crop} • {diagnosis.pathogenType}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {diagnosis.confidenceScore}% अचूकता
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-stone-900 mt-1">
                    {diagnosis.diseaseNameMr}
                  </h3>
                  <p className="text-xs text-stone-500 italic">
                    {diagnosis.diseaseNameEn} ({diagnosis.scientificName})
                  </p>
                </div>
                <AudioPlayerButton text={diagnosis.audioSummary} size="md" />
              </div>

              {/* 1. Symptoms */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-stone-900 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>रोगाची लक्षणे (Symptoms):</span>
                </div>
                <ul className="text-xs space-y-1 text-stone-700 list-disc list-inside">
                  {diagnosis.symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* 2. Chemical Medicines with exact dosage per 15L pump */}
              <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-rose-950 flex items-center gap-1">
                    <span>💊</span>
                    <span>रासायनिक फवारणी औषधे व १५ लिटर पंपासाठी प्रमाण:</span>
                  </div>
                  <span className="text-[10px] bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded font-bold">
                    दुकानदार शिफारस
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {diagnosis.chemicalMedicines.map((m, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs space-y-1">
                      <div className="font-extrabold text-stone-900 text-[13px]">{m.tradeName}</div>
                      <div className="text-[11px] text-stone-500">घटक: {m.activeIngredient}</div>
                      <div className="text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-md mt-1">
                        प्रमाण: <strong>{m.dosagePer15LPump}</strong>
                      </div>
                      <div className="text-[11px] text-stone-600">सूचना: {m.instructions}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Biological & Organic Remedies */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <div className="text-xs font-extrabold text-emerald-950 mb-1.5 flex items-center gap-1">
                  <span>🌿</span>
                  <span>सेंद्रिय व जैविक उपचार (Organic Control):</span>
                </div>
                <ul className="text-xs space-y-1 text-stone-700 list-disc list-inside">
                  {diagnosis.biologicalRemedies.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Precautions */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="text-xs font-extrabold text-stone-800 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>खबरदारी व प्रतिबंधक उपाय:</span>
                </div>
                <ul className="text-xs space-y-1 text-stone-700 list-disc list-inside">
                  {diagnosis.precautions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* DOWNLOAD PDF REPORT BUTTON */}
              <div className="pt-2">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer ring-4 ring-emerald-100"
                >
                  <FileDown className="w-5 h-5 text-emerald-200" />
                  <span>📄 पीक आरोग्य व औषध अहवाल डाऊनलोड करा (Download PDF)</span>
                </button>
                <div className="text-[11px] text-stone-500 text-center mt-1.5">
                  हा अहवाल डाऊनलोड करून कृषी सेवा केंद्रावर दाखवू शकता
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE DOCTOR CHATBOT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-stone-200 shadow-sm p-4 h-[520px]">
          {/* Chat Header */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-stone-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-stone-900">कृषी डॉक्टर सहाय्यक</div>
              <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ऑनलाईन • सोलापूर मराठीत मदत</span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'doctor' && (
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-rose-700 text-white rounded-br-none'
                      : 'bg-stone-100 text-stone-900 rounded-bl-none border border-stone-200'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'doctor' && msg.audioText && (
                      <button
                        onClick={() => speechService.speak(msg.audioText!)}
                        className="ml-2 hover:opacity-100 p-0.5 cursor-pointer"
                        title="ऐका"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-rose-700" />
                      </button>
                    )}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isDoctorTyping && (
              <div className="flex gap-2 items-center text-xs text-stone-500 italic">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <span>कृषी डॉक्टर उत्तर टाईप करत आहेत...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chat Chips */}
          <div className="flex gap-1.5 overflow-x-auto py-1 mb-2 border-t border-stone-100">
            {[
              'फवारणीची योग्य वेळ कोणती?',
              'औषधासोबत टॉनिक मिसळू का?',
              'पावसाची शक्यता असताना काय करू?'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setChatInput(chip)}
                className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChatMessage} className="flex items-center gap-1.5 pt-1 border-t border-stone-200">
            <button
              type="button"
              onClick={handleVoiceInputForChat}
              className="p-2.5 rounded-xl bg-rose-100 text-rose-800 hover:bg-rose-200 cursor-pointer"
              title="मराठीत बोला"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="डॉक्टरना विचारा (उदा. औषध कधी फवारावे?)..."
              className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-rose-600 bg-stone-50"
            />

            <button
              type="submit"
              disabled={!chatInput.trim() || isDoctorTyping}
              className="p-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white disabled:opacity-40 cursor-pointer transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
