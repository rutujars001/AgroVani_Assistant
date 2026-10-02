import React, { useState } from 'react';
import { ArrowLeft, Mic, Search, BookOpen, Volume2, CheckCircle, ExternalLink } from 'lucide-react';
import { GOVERNMENT_SCHEMES_DATA } from '../../data/agriculturalData';
import { GovernmentScheme } from '../../types';
import { AudioPlayerButton } from '../AudioPlayerButton';
import { speechService } from '../../services/speechService';

interface GovernmentSchemesModuleProps {
  onBack: () => void;
  onOpenVoice: () => void;
}

export const GovernmentSchemesModule: React.FC<GovernmentSchemesModuleProps> = ({
  onBack,
  onOpenVoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string>('pmfby');

  const filtered = GOVERNMENT_SCHEMES_DATA.filter(s =>
    s.titleMr.includes(searchTerm) || s.category.includes(searchTerm)
  );

  const toggleExpand = (scheme: GovernmentScheme) => {
    speechService.hapticFeedback(30);
    if (expandedId === scheme.id) {
      setExpandedId('');
    } else {
      setExpandedId(scheme.id);
      speechService.speak(scheme.audioText);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-stone-50 select-none pb-10 overflow-y-auto">
      {/* Top Header Matching Figure 6 */}
      <div className="bg-emerald-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-emerald-700 cursor-pointer text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-extrabold">शासकीय योजना</h2>
            <p className="text-xs text-emerald-200">शेतकऱ्यांसाठी सरकारी मदत</p>
          </div>
        </div>
        <AudioPlayerButton
          text="शासकीय योजना विभाग. पीक विमा, ठिबक सिंचन अनुदान, पीएम किसान आणि शेततळे योजनेची संपूर्ण माहिती येथे उपलब्ध आहे."
          size="sm"
        />
      </div>

      {/* Search Input Matching Figure 6 */}
      <div className="relative mb-2.5">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="योजना शोधा..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs font-semibold focus:outline-emerald-600 shadow-2xs"
        />
      </div>

      {/* Prominent Voice Bar Matching Figure 6 */}
      <div
        onClick={onOpenVoice}
        className="bg-white border-2 border-emerald-300 rounded-2xl p-3 mb-3 shadow-2xs flex items-center justify-between cursor-pointer hover:border-emerald-500 transition"
      >
        <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Mic className="w-4 h-4 text-emerald-700" />
          </div>
          <span>बोला: "पीक विमा योजना बद्दल माहिती सांगा"</span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">
          बोला
        </span>
      </div>

      {/* List of Schemes Matching Figure 6 */}
      <div className="space-y-3">
        {filtered.map((scheme) => {
          const isExpanded = expandedId === scheme.id;
          return (
            <div
              key={scheme.id}
              className={`rounded-2xl border-2 transition-all shadow-xs overflow-hidden ${
                isExpanded ? 'bg-white border-purple-500' : 'bg-white border-stone-200'
              }`}
            >
              {/* Card Banner Header Matching Figure 6 Style (e.g. Purple Banner for PMFBY, Teal for Drip) */}
              <div className={`p-3 text-white ${
                scheme.id === 'pmfby'
                  ? 'bg-purple-800'
                  : scheme.id === 'drip-subsidy'
                  ? 'bg-teal-700'
                  : 'bg-emerald-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold">{scheme.titleMr}</h3>
                    <p className="text-[11px] opacity-90">{scheme.summaryMr}</p>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {scheme.subsidyAmount}
                  </span>
                </div>

                {/* Dual Action Buttons Matching Figure 6 ("वाचा" & "ऐका") */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
                  <button
                    onClick={() => toggleExpand(scheme)}
                    className="flex items-center gap-1.5 bg-white text-stone-900 px-3 py-1 rounded-xl text-xs font-bold hover:bg-stone-100 active:scale-95 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                    <span>वाचा</span>
                  </button>
                  <AudioPlayerButton
                    text={scheme.audioText}
                    size="sm"
                    label="ऐका"
                    className="!bg-emerald-600 hover:!bg-emerald-700 text-white"
                  />
                </div>
              </div>

              {/* Expanded Card Details Matching Figure 6 Box */}
              {isExpanded && (
                <div className="p-3.5 bg-purple-50/40 text-xs space-y-2 border-t border-purple-100 animate-in slide-in-from-top-1 duration-150">
                  <div>
                    <strong className="text-purple-950 font-bold">पात्रता: </strong>
                    <span className="text-stone-700">
                      {scheme.eligibility.join(', ')}
                    </span>
                  </div>
                  <div>
                    <strong className="text-purple-950 font-bold">लाभ: </strong>
                    <span className="text-stone-700">
                      दुष्काळ, पूर, गारपीट यामुळे नुकसान झाल्यास थेट भरपाई.
                    </span>
                  </div>
                  <div>
                    <strong className="text-purple-950 font-bold">कागदपत्रे: </strong>
                    <span className="text-stone-700">
                      {scheme.documentsRequired.join(', ')}
                    </span>
                  </div>
                  <div>
                    <strong className="text-purple-950 font-bold">अर्ज कुठे करावा: </strong>
                    <span className="text-stone-700">
                      {scheme.applicationPortal} (बँक किंवा सीएससी केंद्र)
                    </span>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
                    <span>मुदत: {scheme.deadline}</span>
                    <button
                      onClick={() => speechService.speak(`अर्ज करण्यासाठी आपले सरकार सेवा केंद्र किंवा जवळच्या बँकेत ७/१२ आणि आधार कार्ड घेऊन संपर्क करा.`)}
                      className="text-purple-700 font-bold underline"
                    >
                      मदत हवी आहे?
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
