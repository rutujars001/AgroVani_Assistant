import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Volume2,
  Droplets,
  Sprout,
  ShieldAlert,
  Wrench,
  Clock,
  Sparkles,
  Sliders,
  ChevronRight,
  Stethoscope,
  Plus,
  RefreshCw,
  Award
} from 'lucide-react';
import { CropCalendarTask, FarmerProfile } from '../types';
import { cropCalendarService } from '../services/cropCalendarService';
import { speechService } from '../services/speechService';
import { AudioPlayerButton } from './AudioPlayerButton';

interface CropCalendarWidgetProps {
  profile: FarmerProfile;
  onOpenDoctorCheck?: (crop: string) => void;
  onOpenMyFarm?: () => void;
}

export const CropCalendarWidget: React.FC<CropCalendarWidgetProps> = ({
  profile,
  onOpenDoctorCheck,
  onOpenMyFarm
}) => {
  const [tasks, setTasks] = useState<CropCalendarTask[]>([]);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [isAdjustDaysOpen, setIsAdjustDaysOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<string>('डाळिंब');
  const [customDaysInput, setCustomDaysInput] = useState<number>(85);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  const primaryCrops =
    profile.selectedPrimaryCrops && profile.selectedPrimaryCrops.length > 0
      ? profile.selectedPrimaryCrops
      : ['डाळिंब', 'कांदा', 'ज्वारी'];

  const reloadTasks = () => {
    const list = cropCalendarService.getDailyTasksForProfile(profile);
    setTasks(list);
  };

  useEffect(() => {
    reloadTasks();
  }, [profile]);

  const handleToggleTask = (taskId: string) => {
    speechService.hapticFeedback(35);
    const wasDone = cropCalendarService.toggleTaskCompletion(taskId);
    reloadTasks();
    if (wasDone) {
      speechService.playTone('confirm');
    }
  };

  const handleResetDailyTasks = () => {
    speechService.hapticFeedback(30);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agrovani_calendar_completed_tasks');
    }
    reloadTasks();
    speechService.speak('नवीन दिवसासाठी आजची कामे रीफ्रेश केली आहेत.');
  };

  const handleSaveCropDays = () => {
    speechService.hapticFeedback(40);
    cropCalendarService.setCropDays(editingCrop, customDaysInput);
    setIsAdjustDaysOpen(false);
    reloadTasks();
  };

  const handlePlayAudioSummary = () => {
    speechService.stopSpeaking();
    speechService.hapticFeedback(30);
    const filteredTasks =
      selectedCropFilter === 'all'
        ? tasks
        : tasks.filter((t) => t.cropName === selectedCropFilter);

    const summaryText = cropCalendarService.getAudioSummary(filteredTasks);
    setIsSpeakingSummary(true);
    speechService.speak(summaryText, () => {
      setIsSpeakingSummary(false);
    });
  };

  // Filter tasks based on selected crop filter
  const displayedTasks =
    selectedCropFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.cropName === selectedCropFilter);

  const completedCount = displayedTasks.filter((t) => t.isCompleted).length;
  const totalCount = displayedTasks.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Selected crop growth stage info for detail view
  const activeCropForStage =
    selectedCropFilter !== 'all' ? selectedCropFilter : primaryCrops[0] || 'डाळिंब';
  const activeDays = cropCalendarService.getCropPlantedDays(profile, activeCropForStage);
  const currentStageInfo = cropCalendarService.getCurrentStage(activeCropForStage, activeDays);

  const getCategoryIcon = (category: string) => {
    if (category.includes('पाणी')) return <Droplets className="w-3.5 h-3.5 text-sky-600" />;
    if (category.includes('खत')) return <Sprout className="w-3.5 h-3.5 text-emerald-600" />;
    if (category.includes('फवारणी')) return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
    if (category.includes('काढणी')) return <Award className="w-3.5 h-3.5 text-amber-600" />;
    return <Wrench className="w-3.5 h-3.5 text-purple-600" />;
  };

  const getCategoryBadgeClass = (category: string) => {
    if (category.includes('पाणी')) return 'bg-sky-100 text-sky-800 border-sky-200';
    if (category.includes('खत')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (category.includes('फवारणी')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (category.includes('काढणी')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const getPriorityBadgeClass = (priority: string) => {
    if (priority.includes('उच्च')) return 'bg-rose-50 text-rose-700 border-rose-200 font-extrabold';
    if (priority.includes('मध्यम')) return 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
    return 'bg-stone-100 text-stone-700 border-stone-200 font-medium';
  };

  // Format today's date in Marathi
  const todayFormatted = new Date().toLocaleDateString('mr-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-sm p-4 mb-4 select-none">
      {/* Calendar Header */}
      <div className="flex items-start justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-stone-900 tracking-tight">
                पीक दिनदर्शिका (Crop Calendar)
              </h3>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                दैनिक कामे
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1 mt-0.5">
              <span>{todayFormatted}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                {completedCount}/{totalCount} कामे पूर्ण ({percentComplete}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Daily Reset button */}
          {completedCount > 0 && (
            <button
              onClick={handleResetDailyTasks}
              className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200 text-xs font-bold cursor-pointer active:scale-95 transition"
              title="नवीन दिवसाची कामे रीसेट करा"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Audio Briefing button */}
          <button
            onClick={handlePlayAudioSummary}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition active:scale-95 shadow-2xs ${
              isSpeakingSummary
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
            title="आजची सर्व कामे ऐका"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-[11px]">{isSpeakingSummary ? 'थांबवा' : 'कामे ऐका'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2.5 mb-3 bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
        <div
          className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Crop Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            speechService.hapticFeedback(20);
            setSelectedCropFilter('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer transition active:scale-95 border ${
            selectedCropFilter === 'all'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
          }`}
        >
          सर्व पिके ({tasks.length})
        </button>

        {primaryCrops.map((crop) => {
          const days = cropCalendarService.getCropPlantedDays(profile, crop);
          const isSelected = selectedCropFilter === crop;
          const cycle = currentStageInfo.cycle;
          const icon = crop === 'डाळिंब' ? '🍎' : crop === 'कांदा' ? '🧅' : crop === 'ऊस' ? '🎋' : '🌾';

          return (
            <button
              key={crop}
              onClick={() => {
                speechService.hapticFeedback(20);
                setSelectedCropFilter(crop);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition active:scale-95 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
            >
              <span>{icon}</span>
              <span>{crop}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-md ${
                  isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {days} दि.
              </span>
            </button>
          );
        })}

        {/* Adjust Days Settings Shortcut */}
        <button
          onClick={() => {
            speechService.hapticFeedback(25);
            setEditingCrop(selectedCropFilter === 'all' ? primaryCrops[0] || 'डाळिंब' : selectedCropFilter);
            setCustomDaysInput(
              cropCalendarService.getCropPlantedDays(
                profile,
                selectedCropFilter === 'all' ? primaryCrops[0] || 'डाळिंब' : selectedCropFilter
              )
            );
            setIsAdjustDaysOpen(true);
          }}
          className="px-2 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center gap-1 whitespace-nowrap cursor-pointer active:scale-95"
          title="पिकाचे दिवस बदला"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[10px]">दिवस बदला</span>
        </button>
      </div>

      {/* Growth Stage Summary Card for the selected crop */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 mb-3 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {activeCropForStage === 'डाळिंब' ? '🍎' : activeCropForStage === 'कांदा' ? '🧅' : '🌾'}
          </div>
          <div>
            <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <span>{activeCropForStage}: {currentStageInfo.stage.stageName}</span>
              <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded-md">
                टप्पा {currentStageInfo.stageIndex + 1}/{currentStageInfo.totalStages}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5 line-clamp-1">
              {currentStageInfo.stage.healthAdvisory}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            speechService.hapticFeedback(25);
            setEditingCrop(activeCropForStage);
            setCustomDaysInput(activeDays);
            setIsAdjustDaysOpen(true);
          }}
          className="text-[10px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-1 rounded-lg shrink-0 hover:bg-emerald-100 cursor-pointer shadow-2xs"
        >
          बदला
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {displayedTasks.length > 0 ? (
          displayedTasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-2xl border-2 p-3 transition-all duration-200 ${
                task.isCompleted
                  ? 'bg-stone-50 border-stone-200 opacity-80'
                  : 'bg-white border-stone-200 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              {/* Task Header: Crop, Category, Priority, Timing */}
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm">{task.cropIcon}</span>
                  <span className="text-xs font-extrabold text-stone-900">{task.cropName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 font-bold ${getCategoryBadgeClass(
                      task.taskCategory
                    )}`}
                  >
                    {getCategoryIcon(task.taskCategory)}
                    <span>{task.taskCategory.split(' ')[0]}</span>
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md border ${getPriorityBadgeClass(
                      task.priority
                    )}`}
                  >
                    {task.priority.includes('उच्च') ? '🔥 उच्च प्राधान्य' : task.priority.split(' ')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <AudioPlayerButton text={task.audioText} size="sm" />
                </div>
              </div>

              {/* Task Body with Actionable Instructions */}
              <div className="pt-2 flex items-start gap-2.5">
                {/* Complete / Checkbox Button */}
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-0.5 text-stone-400 hover:text-emerald-600 cursor-pointer active:scale-90 transition shrink-0"
                  aria-label={task.isCompleted ? 'अपूर्ण करा' : 'पूर्ण करा'}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-400 hover:text-stone-600" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-extrabold text-stone-900 ${
                        task.isCompleted ? 'line-through text-stone-400' : ''
                      }`}
                    >
                      {task.taskTitle}
                    </h4>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-relaxed ${
                      task.isCompleted ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    {task.taskDescription}
                  </p>

                  {/* Timing & Doctor Action Footer */}
                  <div className="mt-2 flex items-center justify-between flex-wrap gap-1 text-[10px]">
                    <div className="flex items-center gap-1 text-stone-500 font-medium">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{task.timing}</span>
                    </div>

                    {task.taskCategory.includes('फवारणी') && onOpenDoctorCheck && (
                      <button
                        onClick={() => {
                          speechService.hapticFeedback(30);
                          onOpenDoctorCheck(task.cropName);
                        }}
                        className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Stethoscope className="w-3 h-3 text-rose-600" />
                        <span>डॉक्टरकडे तपासा</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
            या पिकासाठी आज कोणतीही प्रलंबित कामे नाहीत.
          </div>
        )}
      </div>

      {/* Footer shortcut to manage crops in My Farm */}
      {onOpenMyFarm && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-500">
            इतर पिके जोडण्यासाठी व शेत नियोजनासाठी:
          </span>
          <button
            onClick={() => {
              speechService.hapticFeedback(25);
              onOpenMyFarm();
            }}
            className="text-[11px] font-extrabold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>माझे शेत व्यवस्थापन</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal / Dialog for Adjusting Crop Days & Stages */}
      {isAdjustDaysOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl border-2 border-emerald-400 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-extrabold text-stone-900">
                  पिकाचे वय (दिवस) निश्चित करा
                </h4>
              </div>
              <button
                onClick={() => setIsAdjustDaysOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              आपल्या शेतात पिकाची पेरणी किंवा छाटणी होऊन किती दिवस झाले आहेत? त्यानुसार दिनदर्शिकेतील दैनंदिन कामे बदलतील.
            </p>

            {/* Select Crop */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                पीक निवडा:
              </label>
              <select
                value={editingCrop}
                onChange={(e) => {
                  setEditingCrop(e.target.value);
                  setCustomDaysInput(cropCalendarService.getCropPlantedDays(profile, e.target.value));
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-500"
              >
                {primaryCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Days Slider & Number Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">
                  लागवडीनंतरचे दिवस:
                </label>
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                  दिवस {customDaysInput}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={editingCrop === 'ऊस' ? 360 : editingCrop === 'डाळिंब' ? 160 : 130}
                value={customDaysInput}
                onChange={(e) => setCustomDaysInput(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>दिवस १ (पेरणी)</span>
                <span>दिवस {Math.round((editingCrop === 'ऊस' ? 360 : 140) / 2)} (वाढ)</span>
                <span>काढणी टप्पा</span>
              </div>
            </div>

            {/* Stage Preview */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <div className="font-bold text-stone-800">
                अपेक्षित टप्पा:{' '}
                <span className="text-emerald-700">
                  {cropCalendarService.getCurrentStage(editingCrop, customDaysInput).stage.stageName}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAdjustDaysOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                रद्द करा
              </button>
              <button
                onClick={handleSaveCropDays}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer shadow-xs active:scale-95"
              >
                जतन करा
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
