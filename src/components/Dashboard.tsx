import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserData } from '../types';
import { CheckCircle2, Play, Circle, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard({ userData }: { userData: UserData | null }) {
  const navigate = useNavigate();
  
  const parts = [
    { name: 'Part 1', range: [1, 30] },
    { name: 'Part 2', range: [31, 60] },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">오늘의 학습</h2>
        <p className="text-slate-500 font-medium">매일 10개씩, 꾸준히 학습하면 영어가 쉬워져요!</p>
      </header>

      {parts.map((part) => (
        <section key={part.name} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              {part.name}: Days {part.range[0]}-{part.range[1]}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: part.range[1] - part.range[0] + 1 }, (_, i) => {
              const day = part.range[0] + i;
              const isCompleted = userData?.dailyProgress?.[day];
              const isCurrent = day === (userData?.lastLearnedDay || 0) + 1;
              const isLocked = day > (userData?.lastLearnedDay || 0) + 1;

              return (
                <DayCard
                  key={day}
                  day={day}
                  isCompleted={!!isCompleted}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  onClick={() => {
                    if (!isLocked) navigate(`/learn/${day}`);
                  }}
                />
              );
            })}
          </div>
        </section>
      ))}
    </motion.div>
  );
}

function DayCard({ day, isCompleted, isCurrent, isLocked, onClick }: { 
  day: number, isCompleted: boolean, isCurrent: boolean, isLocked: boolean, onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "relative aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all group",
        isCompleted ? "bg-emerald-50 border border-emerald-100" : 
        isCurrent ? "bg-indigo-50 border-2 border-indigo-600 shadow-xl shadow-indigo-100 active:scale-95" :
        isLocked ? "bg-slate-100 grayscale cursor-not-allowed opacity-50" : 
        "bg-white border border-slate-200 hover:border-indigo-400"
      )}
    >
      <span className={cn(
        "text-3xl font-black transition-colors leading-none",
        isCompleted ? "text-emerald-500" : isCurrent ? "text-indigo-600" : "text-slate-400"
      )}>
        {day}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Day</span>
      
      <div className="absolute top-3 right-3">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />
        ) : isCurrent ? (
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-slate-300" />
        ) : (
          <Circle className="w-4 h-4 text-slate-200" />
        )}
      </div>

      {isCurrent && (
        <div className="absolute -bottom-1 left-1/4 right-1/4 h-1.5 bg-indigo-600 rounded-full" />
      )}
    </button>
  );
}
