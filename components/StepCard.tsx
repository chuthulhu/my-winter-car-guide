'use client';

import { useState } from 'react';
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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleLoad = (url: string) => {
    setLoadedImages(prev => new Set(prev).add(url));
  };

  const handleError = (url: string) => {
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  return (
    <>
      {/* 탭 이름 및 진행 카운터 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-text-secondary">{activeTab}</span>
        <span className="text-sm text-text-secondary">{currentIndex + 1} / {totalSteps}</span>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 bg-border rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* 드롭다운 — 특정 단계로 바로 점프 */}
      <select
        className="w-full p-3 mb-4 border border-border rounded-xl bg-surface text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary"
        value={currentIndex}
        onChange={(e) => onStepChange(Number(e.target.value))}
      >
        {steps.map((s, idx) => (
          <option key={idx} value={idx}>
            Step {s.step} — {s.partName}
          </option>
        ))}
      </select>

      {/* 단계 제목 */}
      <h1 className="text-2xl font-bold mb-[10px] min-h-[4rem] flex flex-col justify-center leading-tight">
        <span className="text-sm text-text-secondary font-normal mb-1">
          STEP {step ? step.step : '-'}
        </span>
        {step ? step.partName : '데이터가 없습니다.'}
      </h1>

      {/* 부품 이미지 (H열 — /로 구분 시 최대 2개, 로드 성공 시에만 표시) */}
      {step?.partImageUrl && step.partImageUrl.length > 0 && (
        <div className={`flex justify-center gap-4 overflow-hidden transition-all duration-300 ${step.partImageUrl.some(u => loadedImages.has(u)) ? 'mb-8 max-h-[150px]' : 'max-h-0'}`}>
          {step.partImageUrl.map((url, idx) => (
            // eslint-disable-next-line @next/next/no-img-element -- 정적 출력 모드에서 next/image 미지원
            <img
              key={`${step.step}-part-${idx}-${url}`}
              src={url}
              alt={`${step.partName} 부품 이미지 ${idx + 1}`}
              className="max-h-[150px] w-auto object-contain"
              referrerPolicy="no-referrer"
              onLoad={() => handleLoad(url)}
              onError={() => handleError(url)}
            />
          ))}
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
