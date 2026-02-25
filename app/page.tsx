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

// 캐시 TTL: 5분
const CACHE_TTL = 5 * 60 * 1000;

interface CacheEntry {
  data: GuideStep[];
  timestamp: number;
}

export default function CarAssemblyGuide() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TTL 기반 탭별 데이터 캐시
  const cacheRef = useRef<Record<string, CacheEntry>>({});

  const loadData = useCallback(async (tabId: string, forceRefresh = false) => {
    // 캐시 확인 (TTL 미만이면 재사용)
    const cached = cacheRef.current[tabId];
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setSteps(cached.data);
      setCurrentIndex(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuideData(tabId);
      cacheRef.current[tabId] = { data, timestamp: Date.now() };
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
  const handleRetry = () => loadData(activeTab, true);
  const handleRefresh = () => loadData(activeTab, true);

  const currentStep = steps[currentIndex];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground font-sans">
      <div className="w-full max-w-lg p-6 bg-surface rounded-3xl shadow-2xl border border-border">

        {/* 탭 선택 + 새로고침 버튼 */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 overflow-x-auto">
            <TabSelector tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-accent hover:bg-surface-hover rounded-xl transition-all disabled:opacity-30 shrink-0"
            title="데이터 새로고침"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-accent animate-pulse">데이터를 가져오는 중...</div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-xl transition-all font-semibold text-sm"
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