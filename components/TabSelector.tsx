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
              ? 'bg-blue-600 text-white font-bold'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
