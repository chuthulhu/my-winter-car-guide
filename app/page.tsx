'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GuideStep } from './types';
import { fetchGuideData } from '@/lib/fetchGuideData';
import TabSelector from '@/components/TabSelector';
import StepCard from '@/components/StepCard';
import StepNavigation from '@/components/StepNavigation';

// 탭 목록 정의
const TABS = [
  { id: '엔진조립', name: '엔진 조립' },
  { id: '차체조립', name: '차체 조립' },
  { id: '엔진장착/기어/하부조립', name: '하부 조립' },
];

export default function CarAssemblyGuide() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 탭별 데이터 캐시
  const cacheRef = useRef<Record<string, GuideStep[]>>({});

  const loadData = useCallback(async (tabId: string) => {
    // 캐시에 있으면 재사용
    if (cacheRef.current[tabId]) {
      setSteps(cacheRef.current[tabId]);
      setCurrentIndex(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuideData(tabId);
      cacheRef.current[tabId] = data;
      setSteps(data);
      setCurrentIndex(0);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  // 키보드 네비게이션 (←/→ 화살표 키)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(steps.length - 1, prev + 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steps.length]);

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex((prev) => Math.min(steps.length - 1, prev + 1));
  const handleRetry = () => loadData(activeTab);

  const currentStep = steps[currentIndex];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-950 text-white font-sans">
      <div className="w-full max-w-lg p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800">
        <TabSelector tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <div className="py-20 text-center animate-pulse">데이터를 가져오는 중...</div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all font-semibold text-sm"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <StepCard
              step={currentStep}
              activeTab={activeTab}
              currentIndex={currentIndex}
              totalSteps={steps.length}
            />
            <StepNavigation
              currentIndex={currentIndex}
              totalSteps={steps.length}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </main>
  );
}