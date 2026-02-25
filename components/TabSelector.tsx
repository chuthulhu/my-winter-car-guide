export interface Tab {
  id: string;
  name: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabSelector({ tabs, activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
              : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
