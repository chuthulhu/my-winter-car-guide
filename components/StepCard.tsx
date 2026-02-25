import { GuideStep } from '@/app/types';

interface StepCardProps {
  step: GuideStep | undefined;
  activeTab: string;
  currentIndex: number;
  totalSteps: number;
}

export default function StepCard({ step, activeTab, currentIndex, totalSteps }: StepCardProps) {
  return (
    <>
      {/* 탭 이름 및 진행 카운터 */}
      <div className="mb-4 flex justify-between items-center text-sm font-mono text-blue-500">
        <span>{activeTab}</span>
        <span>{currentIndex + 1} / {totalSteps > 0 ? totalSteps : '-'}</span>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: totalSteps > 0 ? `${((currentIndex + 1) / totalSteps) * 100}%` : '0%' }}
        />
      </div>

      {/* 단계 제목 */}
      <h1 className="text-2xl font-bold mb-8 min-h-[4rem] flex flex-col justify-center leading-tight">
        <span className="text-sm text-gray-400 font-normal mb-1">
          STEP {step ? step.step : '-'}
        </span>
        {step ? step.partName : '데이터가 없습니다.'}
      </h1>

      {/* 나사 정보 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <span className="block text-xs text-gray-500 uppercase mb-1">나사 크기</span>
          <span className="text-xl font-bold text-yellow-500">{step?.screwSize || '-'}</span>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <span className="block text-xs text-gray-500 uppercase mb-1">나사 개수</span>
          <span className="text-xl font-bold text-blue-400">{step?.screwCount || '-'}</span>
        </div>
      </div>

      {/* 설명 섹션 */}
      <div className="space-y-3 mb-10">
        <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
          <span className="block text-xs text-blue-400 uppercase mb-2 font-bold">📌 설명 및 팁</span>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {step?.note1 || '추가 설명이 없습니다.'}
          </p>
        </div>

        {step?.note2 && (
          <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-700/30">
            <span className="block text-xs text-yellow-500 uppercase mb-2 font-bold">⚠️ 추가 참고사항</span>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {step.note2}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
