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
        className="flex-1 py-4 bg-surface hover:bg-surface-hover disabled:opacity-20 rounded-2xl transition-all font-semibold border border-border"
      >
        이전
      </button>
      <button
        onClick={onNext}
        disabled={currentIndex === totalSteps - 1 || totalSteps === 0}
        className="flex-1 py-4 bg-primary hover:bg-primary-hover disabled:opacity-20 rounded-2xl transition-all font-bold shadow-lg shadow-primary/20"
      >
        다음 공정
      </button>
    </div>
  );
}
