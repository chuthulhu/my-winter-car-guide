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
      <div className="mb-4 flex justify-between items-center text-sm font-mono text-accent">
        <span>{activeTab}</span>
        <span>{currentIndex + 1} / {totalSteps > 0 ? totalSteps : '-'}</span>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full bg-border rounded-full h-1.5 mb-6">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: totalSteps > 0 ? `${((currentIndex + 1) / totalSteps) * 100}%` : '0%' }}
        />
      </div>

      {/* 단계 제목 */}
      <h1 className="text-2xl font-bold mb-8 min-h-[4rem] flex flex-col justify-center leading-tight">
        <span className="text-sm text-text-secondary font-normal mb-1">
          STEP {step ? step.step : '-'}
        </span>
        {step ? step.partName : '데이터가 없습니다.'}
      </h1>

      {/* 이미지 (있는 경우에만 표시) */}
      {step?.imageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 출력 모드에서 next/image 최적화 미지원, 외부 URL 사용 */}
          <img
            src={step.imageUrl}
            alt={step.partName}
            className="w-full h-auto object-contain bg-surface"
            loading="lazy"
          />
        </div>
      )}

      {/* 나사 정보 — 복수 나사 지원 */}
      <div className="space-y-3 mb-8">
        {step?.screws.map((screw, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4">
            <div className="bg-surface-dim p-4 rounded-xl border border-border-dim">
              <span className="block text-sm text-text-tertiary uppercase mb-1">
                나사 크기{step.screws.length > 1 ? ` ${idx + 1}` : ''}
              </span>
              <span className="text-xl font-bold text-accent">{screw.size}</span>
            </div>
            <div className="bg-surface-dim p-4 rounded-xl border border-border-dim">
              <span className="block text-sm text-text-tertiary uppercase mb-1">
                나사 개수{step.screws.length > 1 ? ` ${idx + 1}` : ''}
              </span>
              <span className="text-xl font-bold text-primary">{screw.count}</span>
            </div>
          </div>
        )) || (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-dim p-4 rounded-xl border border-border-dim">
              <span className="block text-sm text-text-tertiary uppercase mb-1">나사 크기</span>
              <span className="text-xl font-bold text-accent">-</span>
            </div>
            <div className="bg-surface-dim p-4 rounded-xl border border-border-dim">
              <span className="block text-sm text-text-tertiary uppercase mb-1">나사 개수</span>
              <span className="text-xl font-bold text-primary">-</span>
            </div>
          </div>
        )}
      </div>

      {/* 설명 섹션 */}
      <div className="space-y-3 mb-10">
        <div className="bg-accent-dim p-4 rounded-xl border border-accent-border">
          <span className="block text-sm text-accent uppercase mb-2 font-bold">📌 설명 및 팁</span>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {step?.note1 || '추가 설명이 없습니다.'}
          </p>
        </div>

        {step?.note2 && (
          <div className="bg-warning-bg p-4 rounded-xl border border-warning-border">
            <span className="block text-sm text-warning uppercase mb-2 font-bold">⚠️ 추가 참고사항</span>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {step.note2}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
