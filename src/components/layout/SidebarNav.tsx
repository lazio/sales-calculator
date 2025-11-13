import { Button } from '@/components/ui/button';

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
  { id: 'rates', label: 'Rates', icon: '' },
  { id: 'modules', label: 'Modules', icon: '' },
  { id: 'work-breakdown', label: 'Work Breakdown', icon: '' },
];

export default function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  return (
    <nav className="flex flex-col">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          variant={activeSection === item.id ? "default" : "ghost"}
          className="w-full justify-start"
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
