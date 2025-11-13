interface SidebarNavProps {
  activeSection: 'csv-import' | 'rates' | 'modules' | 'work-breakdown';
  onSectionChange: (section: 'csv-import' | 'rates' | 'modules' | 'work-breakdown') => void;
}

interface MenuItem {
  id: 'csv-import' | 'rates' | 'modules' | 'work-breakdown';
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { id: 'csv-import', label: 'CSV Import', icon: '📁' },
  { id: 'rates', label: 'Rates', icon: '💰' },
  { id: 'modules', label: 'Modules', icon: '📦' },
  { id: 'work-breakdown', label: 'Work Breakdown', icon: '📊' },
];

export default function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  return (
    <nav className="flex flex-col space-y-1">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={`
            w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3
            ${activeSection === item.id
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
