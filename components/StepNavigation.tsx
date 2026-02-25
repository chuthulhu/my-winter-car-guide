interface StepNavigationProps {
  currentIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepNavigation({ currentIndex, totalSteps, onPrev, onNext }: StepNavigationProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0 || totalSteps === 0}
        className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-20 rounded-2xl transition-all font-semibold"
      >
        이전
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === totalSteps - 1 || totalSteps === 0}
        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 rounded-2xl transition-all font-bold shadow-lg shadow-blue-900/20"
      >
        다음 공정
      </button>
    </div>
  );
}
