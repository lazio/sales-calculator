import { Button } from '@/components/ui/button';
import { Calculator, Layers, BarChart3, LucideIcon } from 'lucide-react';

interface SidebarNavProps {
  activeSection: 'csv-import' | 'rates' | 'modules' | 'work-breakdown';
  onSectionChange: (section: 'csv-import' | 'rates' | 'modules' | 'work-breakdown') => void;
}

interface MenuItem {
  id: 'csv-import' | 'rates' | 'modules' | 'work-breakdown';
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { id: 'rates', label: 'Rates', icon: Calculator },
  { id: 'modules', label: 'Modules', icon: Layers },
  { id: 'work-breakdown', label: 'Work Breakdown', icon: BarChart3 },
];

export default function SidebarNav({ activeSection, onSectionChange }: SidebarNavProps) {
  return (
    <nav className="flex flex-col">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            variant={activeSection === item.id ? "default" : "ghost"}
            className="w-full justify-start"
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
