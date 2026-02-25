import { GuideStep } from '@/app/types';

interface StepCardProps {
  step: GuideStep | undefined;
  steps: GuideStep[];
  activeTab: string;
  currentIndex: number;
  totalSteps: number;
  onStepChange: (index: number) => void;
}

export default function StepCard({ step, steps, activeTab, currentIndex, totalSteps, onStepChange }: StepCardProps) {
  return (
    <>
      {/* 탭 이름 및 진행 카운터 */}
      <div className="mb-4 flex justify-between items-center text-sm font-mono text-text-secondary">
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

      {/* 부품명 드롭다운 — 특정 단계로 바로 이동 */}
      <select
        value={currentIndex}
        onChange={(e) => onStepChange(Number(e.target.value))}
        className="w-full mb-6 p-3 bg-surface border border-border rounded-xl text-foreground text-sm appearance-none cursor-pointer hover:border-primary transition-all focus:outline-none focus:border-primary"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7585' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
      >
        {steps.map((s, idx) => (
          <option key={idx} value={idx} className="bg-surface text-foreground">
            Step {s.step} — {s.partName}
          </option>
        ))}
      </select>

      {/* 단계 제목 */}
      <h1 className="text-2xl font-bold mb-8 min-h-[4rem] flex flex-col justify-center leading-tight">
        <span className="text-sm text-text-secondary font-normal mb-1">
          STEP {step ? step.step : '-'}
        </span>
        {step ? step.partName : '데이터가 없습니다.'}
      </h1>

      {/* 나사 정보 — 복수 나사 지원 */}
      <div className="space-y-3 mb-8">
        {step?.screws.map((screw, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4">
            <div className="bg-surface-dim p-4 rounded-xl border border-border-dim">
              <span className="block text-sm text-text-tertiary uppercase mb-1">
                나사 크기{step.screws.length > 1 ? ` ${idx + 1}` : ''}
              </span>
              <span className="text-xl font-bold text-foreground">{screw.size}</span>
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
              <span className="text-xl font-bold text-foreground">-</span>
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
        {/* 설명 및 팁 — 내용이 있을 때만 표시 */}
        {step?.note1 && (
          <div className="bg-accent-dim p-4 rounded-xl border border-accent-border">
            <span className="block text-sm text-primary uppercase mb-2 font-bold">📌 설명 및 팁</span>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {step.note1}
            </p>
          </div>
        )}

        {/* 추가 참고사항 — 내용이 있을 때만 표시 */}
        {step?.note2 && (
          <div className="bg-warning-bg p-4 rounded-xl border border-warning-border">
            <span className="block text-sm text-warning uppercase mb-2 font-bold">⚠️ 추가 참고사항</span>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {step.note2}
            </p>
          </div>
        )}

        {/* 이미지 — 추가 참고사항 아래에 위치 */}
        {step?.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 출력 모드에서 next/image 최적화 미지원, 외부 URL 사용 */}
            <img
              src={step.imageUrl}
              alt={step.partName}
              className="w-full h-auto object-contain bg-surface"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </>
  );
}
