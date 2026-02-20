'use client';

import { useState, useEffect } from 'react';
import { GuideStep } from './types';

// 탭 목록 정의
const TABS = [
  { id: '엔진조립', name: '엔진 조립' },
  { id: '차체조립', name: '차체 조립' },
  { id: '엔진장착/기어/하부조립', name: '하부 조립' }
];

// Google Visualization API Response Interfaces
interface GvizCell {
  v: string | number | null;
  f?: string;
}

interface GvizRow {
  c: (GvizCell | null)[];
}

interface GvizTable {
  cols: { id: string; label: string; type: string }[];
  rows: GvizRow[];
}

interface GvizResponse {
  version: string;
  status: string;
  table: GvizTable;
}

async function fetchGuideData(tabName: string): Promise<GuideStep[]> {
  const url = `https://docs.google.com/spreadsheets/d/1Y695S7q8HfNluMx3SPY33WFt_yd76XUZM9F7MNnDYg4/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tabName)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const jsonString = text.substring(47).slice(0, -2);

  const data: GvizResponse = JSON.parse(jsonString);
  const rows = data.table.rows;

  return rows.map((row: GvizRow) => {
    const c = row.c;
    if (!c) return null;

    return {
      step: c[0]?.f || c[0]?.v?.toString() || '',
      partName: c[1]?.v?.toString() || '',
      screwSize: c[2]?.f || c[2]?.v?.toString() || '-',
      screwCount: c[3]?.v?.toString() || '-',
      note1: c[5]?.v?.toString() || '',
      note2: c[6]?.v?.toString() || '',
    };
  }).filter((step): step is GuideStep => step !== null && step.step !== '');
}

export default function CarAssemblyGuide() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGuideData(activeTab);
        setSteps(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab]);

  const currentStep = steps[currentIndex];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-950 text-white font-sans">
      <div className="w-full max-w-lg p-6 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800">
        
        {/* 상단 탭 선택기 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white font-bold' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse">데이터를 가져오는 중...</div>
        ) : error ? (
            <div className="py-20 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center text-sm font-mono text-blue-500">
              <span>{activeTab}</span>
              <span>{currentIndex + 1} / {steps.length > 0 ? steps.length : '-'}</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-8 min-h-[4rem] flex flex-col justify-center leading-tight">
                <span className="text-sm text-gray-400 font-normal mb-1">STEP {currentStep ? currentStep.step : '-'}</span>
                {currentStep ? currentStep.partName : '데이터가 없습니다.'}
            </h1>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <span className="block text-xs text-gray-500 uppercase mb-1">나사 크기</span>
                <span className="text-xl font-bold text-yellow-500">{currentStep?.screwSize || '-'}</span>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <span className="block text-xs text-gray-500 uppercase mb-1">나사 개수</span>
                <span className="text-xl font-bold text-blue-400">{currentStep?.screwCount || '-'}</span>
              </div>
            </div>

            {/* 설명 섹션 (Note 1 & Note 2) */}
            <div className="space-y-3 mb-10">
                {/* Note 1: 주요 설명 */}
                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                    <span className="block text-xs text-blue-400 uppercase mb-2 font-bold">📌 설명 및 팁</span>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {currentStep?.note1 || '추가 설명이 없습니다.'}
                    </p>
                </div>

                {/* Note 2: 추가 정보 (있는 경우에만 표시) */}
                {currentStep?.note2 && (
                    <div className="bg-yellow-900/20 p-4 rounded-xl border border-yellow-700/30">
                        <span className="block text-xs text-yellow-500 uppercase mb-2 font-bold">⚠️ 추가 참고사항</span>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {currentStep.note2}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0 || steps.length === 0}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-20 rounded-2xl transition-all font-semibold"
              >
                이전
              </button>
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={currentIndex === steps.length - 1 || steps.length === 0}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-2xl transition-all font-bold shadow-lg shadow-blue-900/20"
              >
                다음 공정
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}