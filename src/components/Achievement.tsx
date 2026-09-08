import React, { useState } from 'react';
import { Achievement as AchievementType } from '../types.js';
import {
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  Music,
  TrendingUp,
  Filter,
  ChevronRight,
  Info
} from 'lucide-react';

interface AchievementProps {
  achievements: AchievementType[];
  onNavigateToPractice?: () => void;
  onNavigateToLessons?: () => void;
  onNavigateToSongs?: () => void;
  className?: string;
}

export const Achievement: React.FC<AchievementProps> = ({
  achievements,
  onNavigateToPractice,
  onNavigateToLessons,
  onNavigateToSongs,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState<boolean>(false);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementType | null>(null);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Tier metadata helper
  const getTierStyles = (tier?: string, unlocked?: boolean) => {
    if (!unlocked) {
      return {
        cardBorder: 'border-stone-200 bg-stone-50/70',
        badgeBg: 'bg-stone-200 text-stone-600',
        iconBg: 'bg-stone-200/80 text-stone-400 grayscale',
        pillBg: 'bg-stone-100 text-stone-500 border-stone-200',
        accentText: 'text-stone-400',
      };
    }

    switch (tier) {
      case 'platinum':
        return {
          cardBorder: 'border-purple-300 bg-linear-to-b from-purple-50/50 to-white shadow-sm hover:border-purple-400',
          badgeBg: 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-xs',
          iconBg: 'bg-purple-100 text-purple-700 ring-2 ring-purple-300 ring-offset-1',
          pillBg: 'bg-purple-50 text-purple-800 border-purple-200',
          accentText: 'text-purple-700',
        };
      case 'gold':
        return {
          cardBorder: 'border-amber-300 bg-linear-to-b from-amber-50/40 to-white shadow-sm hover:border-amber-400',
          badgeBg: 'bg-linear-to-r from-amber-500 to-yellow-600 text-white shadow-xs',
          iconBg: 'bg-amber-100 text-amber-800 ring-2 ring-amber-300 ring-offset-1',
          pillBg: 'bg-amber-50 text-amber-900 border-amber-200',
          accentText: 'text-amber-800',
        };
      case 'silver':
        return {
          cardBorder: 'border-slate-300 bg-linear-to-b from-slate-50/50 to-white shadow-sm hover:border-slate-400',
          badgeBg: 'bg-linear-to-r from-slate-500 to-slate-700 text-white shadow-xs',
          iconBg: 'bg-slate-100 text-slate-700 ring-2 ring-slate-300 ring-offset-1',
          pillBg: 'bg-slate-50 text-slate-800 border-slate-200',
          accentText: 'text-slate-700',
        };
      case 'bronze':
      default:
        return {
          cardBorder: 'border-amber-700/20 bg-linear-to-b from-amber-50/30 to-white shadow-sm hover:border-amber-600/40',
          badgeBg: 'bg-linear-to-r from-amber-700 to-amber-800 text-white shadow-xs',
          iconBg: 'bg-amber-100/80 text-amber-900 ring-2 ring-amber-200 ring-offset-1',
          pillBg: 'bg-amber-50/80 text-amber-900 border-amber-200',
          accentText: 'text-amber-900',
        };
    }
  };

  // Rank determination
  const rankTitle =
    unlockPercentage >= 80 ? 'Master Virtuoso' :
    unlockPercentage >= 50 ? 'Gold Keymaster' :
    unlockPercentage >= 25 ? 'Silver Scholar' :
    'Key Apprentice';

  // Filtered achievements
  const filteredAchievements = achievements.filter(a => {
    if (filterUnlockedOnly && !a.unlocked) return false;
    if (activeCategory !== 'ALL' && a.category?.toUpperCase() !== activeCategory) return false;
    return true;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Milestone Header Summary Banner */}
      <div className="bg-linear-to-br from-amber-950 via-stone-900 to-stone-950 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-amber-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Progression & Badges</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Learning Milestones
            </h2>
            <p className="text-stone-300 text-sm max-w-xl">
              Earn official studio badges as you complete structured curriculum lessons, build daily practice discipline, and perform repertoire songs.
            </p>
          </div>

          {/* Level / Status Tile */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[240px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">Studio Rank</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-amber-950">
                {rankTitle}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{unlockedCount}</span>
              <span className="text-sm text-stone-300 font-medium">/ {totalCount} Badges Unlocked</span>
            </div>
            <div className="w-full bg-stone-700/60 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-linear-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${unlockPercentage}%` }}
              />
            </div>
            <div className="text-right mt-1 text-[11px] font-bold text-amber-200">
              {unlockPercentage}% Completed
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Category Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'TECHNIQUE', 'PRACTICE', 'THEORY', 'REPERTOIRE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-amber-900 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat === 'ALL' ? 'All Goals' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Unlocked Only Toggle */}
        <button
          onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border self-start sm:self-auto ${
            filterUnlockedOnly
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${filterUnlockedOnly ? 'text-amber-700' : 'text-stone-400'}`} />
          <span>Unlocked Only</span>
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map((badge) => {
          const isUnlocked = !!badge.unlocked;
          const styles = getTierStyles(badge.tier, isUnlocked);
          const currentVal = badge.currentValue ?? (isUnlocked ? 1 : 0);
          const targetVal = badge.targetValue ?? 1;
          const progressPercent = Math.min(100, Math.round((currentVal / targetVal) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedAchievement(badge)}
              className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${styles.cardBorder} hover:shadow-md`}
            >
              {/* Top Row: Icon + Tier Pill */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 ${styles.iconBg}`}>
                  {badge.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.pillBg}`}>
                    {badge.tier || 'bronze'}
                  </span>
                  {badge.category && (
                    <span className="text-[10px] font-medium text-stone-500 uppercase">
                      {badge.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1 mb-4 grow">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-stone-900 text-base leading-tight group-hover:text-amber-900 transition">
                    {badge.title}
                  </h3>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress & Status Footer */}
              <div className="pt-3 border-t border-stone-100/80 space-y-2 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-500">
                    {isUnlocked ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unlocked {badge.unlockedAt ? `• ${badge.unlockedAt}` : ''}
                      </span>
                    ) : (
                      <span>Progress:</span>
                    )}
                  </span>
                  {!isUnlocked && (
                    <span className="font-mono font-bold text-stone-700">
                      {currentVal} / {targetVal} {badge.unit || ''}
                    </span>
                  )}
                </div>

                {/* Progress Bar (if not yet unlocked) */}
                {!isUnlocked && (
                  <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-700 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-10 text-center space-y-2">
          <Award className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-stone-700">No milestones found</h4>
          <p className="text-xs text-stone-500">
            {filterUnlockedOnly
              ? 'You have not unlocked any badges in this category yet. Keep practicing to earn your first badge!'
              : 'Try selecting a different category filter.'}
          </p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-stone-200 space-y-5 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl ring-4 ring-amber-50">
                {selectedAchievement.icon}
              </div>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                  {selectedAchievement.tier || 'bronze'} Tier
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {selectedAchievement.category}
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                {selectedAchievement.title}
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                {selectedAchievement.description}
              </p>
            </div>

            {/* Status Breakdown */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 font-medium">Status</span>
                {selectedAchievement.unlocked ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-stone-600 bg-stone-200/60 px-2.5 py-1 rounded-full text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    In Progress
                  </span>
                )}
              </div>

              {!selectedAchievement.unlocked && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                    <span>Target Metric</span>
                    <span className="font-mono font-bold text-stone-900">
                      {selectedAchievement.currentValue ?? 0} / {selectedAchievement.targetValue ?? 1} {selectedAchievement.unit || ''}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-700 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round(((selectedAchievement.currentValue ?? 0) / (selectedAchievement.targetValue ?? 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onNavigateToPractice && (
                <button
                  onClick={() => {
                    setSelectedAchievement(null);
                    onNavigateToPractice();
                  }}
                  className="flex-1 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Practice Now
                </button>
              )}
              {onNavigateToLessons && (
                <button
                  onClick={() => {
                    setSelectedAchievement(null);
                    onNavigateToLessons();
                  }}
                  className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Open Curriculum
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
