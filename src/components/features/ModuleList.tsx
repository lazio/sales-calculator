import { useState, useMemo } from 'react';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';
import { calculateModuleStats, calculateModulePrice } from '@/services/calculationEngine';
import AddModuleForm from './AddModuleForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, X, Settings2 } from 'lucide-react';

interface ModuleListProps {
  modules: ProjectModule[];
  onToggle: (id: string) => void;
  onBulkToggle?: (enabled: boolean) => void;
  onAddModule?: (moduleData: {
    name: string;
    designDays: number;
    frontendDays: number;
    backendDays: number;
    designPerformers: string[];
    developmentPerformers: string[];
  }) => void;
  rates: RateConfig[];
  overlapDays?: number;
  currency?: '$' | '€';
}

type SortOption = 'default' | 'name' | 'price' | 'timeline';

export default function ModuleList({ modules, onToggle, onBulkToggle, onAddModule, rates, overlapDays = Infinity, currency = '$' }: ModuleListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortDesc, setSortDesc] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    design: true,
    frontend: true,
    backend: true,
    timeline: true,
    team: true,
    price: true,
  });

  if (modules.length === 0) {
    return null;
  }

  // Calculate statistics using centralized business logic
  const { timelineDays, effortDays } = calculateModuleStats(modules, overlapDays);

  // Calculate total cost for percentage display
  const totalCost = useMemo(() => {
    return modules
      .filter(m => m.isEnabled)
      .reduce((sum, m) => sum + calculateModulePrice(m, rates), 0);
  }, [modules, rates]);

  // Sort modules
  const sortedModules = useMemo(() => {
    // If default sort, maintain original CSV order
    if (sortBy === 'default') {
      return modules;
    }

    const sorted = [...modules];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = calculateModulePrice(a, rates) - calculateModulePrice(b, rates);
          break;
        case 'timeline':
          comparison = Math.max(a.designDays, a.frontendDays, a.backendDays) -
                      Math.max(b.designDays, b.frontendDays, b.backendDays);
          break;
      }
      return sortDesc ? -comparison : comparison;
    });
    return sorted;
  }, [modules, sortBy, sortDesc, rates]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle sort direction, except for 'default' which doesn't have direction
      if (option !== 'default') {
        setSortDesc(!sortDesc);
      }
    } else {
      setSortBy(option);
      setSortDesc(false);
    }
  };

  const handleAddModule = (moduleData: {
    name: string;
    designDays: number;
    frontendDays: number;
    backendDays: number;
    designPerformers: string[];
    developmentPerformers: string[];
  }) => {
    if (onAddModule) {
      onAddModule(moduleData);
      setShowAddForm(false);
    }
  };

  const availablePerformers = rates.map(r => r.role);

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-2">
        <h3 className="mb-2">Project Modules</h3>
        <p className="text-muted-foreground">
          {modules.filter(m => m.isEnabled).length} of {modules.length} enabled • {timelineDays} days timeline • {effortDays} days effort
        </p>
      </div>

      <div className="flex justify-end gap-2 mb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={visibleColumns.design}
              onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, design: !!checked })}
            >
              Design
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.frontend}
              onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, frontend: !!checked })}
            >
              Frontend
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.backend}
              onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, backend: !!checked })}
            >
              Backend
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.timeline}
              onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, timeline: !!checked })}
            >
              Timeline
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.team}
              onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, team: !!checked })}
            >
              Team
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleColumns.price}
              onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, price: !!checked })}
            >
              Price
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {onAddModule && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "outline" : "default"}
            size="sm"
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Module
              </>
            )}
          </Button>
        )}
      </div>

      {/* Add Module Form */}
      {showAddForm && onAddModule && (
        <AddModuleForm
          availablePerformers={availablePerformers}
          onSubmit={handleAddModule}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                {onBulkToggle && (
                  <Checkbox
                    checked={modules.every(m => m.isEnabled)}
                    onCheckedChange={(checked) => onBulkToggle(!!checked)}
                  />
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                Module{sortBy === 'name' && <>{'\u00A0'}{sortDesc ? '↓' : '↑'}</>}
              </TableHead>
              {visibleColumns.design && <TableHead>Design</TableHead>}
              {visibleColumns.frontend && <TableHead>Frontend</TableHead>}
              {visibleColumns.backend && <TableHead>Backend</TableHead>}
              {visibleColumns.timeline && (
                <TableHead
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('timeline')}
                >
                  Timeline{sortBy === 'timeline' && <>{'\u00A0'}{sortDesc ? '↓' : '↑'}</>}
                </TableHead>
              )}
              {visibleColumns.team && <TableHead>Team</TableHead>}
              {visibleColumns.price && (
                <TableHead
                  className="text-right cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('price')}
                >
                  Price{sortBy === 'price' && <>{'\u00A0'}{sortDesc ? '↓' : '↑'}</>}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedModules.map((module) => {
              const isEnabled = module.isEnabled;
              const modulePrice = calculateModulePrice(module, rates);
              const costPercentage = totalCost > 0 ? Math.round((modulePrice / totalCost) * 100) : 0;

              return (
                <TableRow
                  key={module.id}
                  onClick={() => onToggle(module.id)}
                  className={`cursor-pointer ${!isEnabled && 'opacity-50'}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={module.isEnabled}
                      onCheckedChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-none"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  {visibleColumns.design && <TableCell>{module.designDays}</TableCell>}
                  {visibleColumns.frontend && <TableCell>{module.frontendDays}</TableCell>}
                  {visibleColumns.backend && <TableCell>{module.backendDays}</TableCell>}
                  {visibleColumns.timeline && (
                    <TableCell>{Math.max(module.designDays, module.frontendDays, module.backendDays)}</TableCell>
                  )}
                  {visibleColumns.team && (
                    <TableCell>
                      <div className="flex gap-1 overflow-hidden" title={
                        [...(module.designDays > 0 && module.designPerformers.length > 0 ? module.designPerformers : []),
                         ...(module.frontendDays > 0 || module.backendDays > 0) && module.developmentPerformers.length > 0 ? module.developmentPerformers : []].join(', ')
                      }>
                        {module.designPerformers.length > 0 && module.designDays > 0 && (
                          module.designPerformers.map((performer, idx) => (
                            <Badge key={`design-${idx}`} variant="outline" className="whitespace-nowrap">
                              {performer}
                            </Badge>
                          ))
                        )}
                        {module.developmentPerformers.length > 0 && (module.frontendDays > 0 || module.backendDays > 0) && (
                          module.developmentPerformers.map((performer, idx) => (
                            <Badge key={`dev-${idx}`} variant="outline" className="whitespace-nowrap">
                              {performer}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.price && (
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {currency}{modulePrice.toLocaleString()}
                        {totalCost > 0 && (
                          <span className="ml-1">({costPercentage}%)</span>
                        )}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
