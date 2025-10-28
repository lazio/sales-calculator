import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModuleList from '@/components/features/ModuleList';
import { ProjectModule } from '@/types/project.types';
import { RateConfig } from '@/types/rates.types';

describe('Integration Tests', () => {
  describe('ModuleList with AddModule Integration', () => {
    const mockRates: RateConfig[] = [
      { role: 'UI Designer', monthlyRate: 4000 },
      { role: 'Frontend Developer', monthlyRate: 5000 },
      { role: 'Backend Developer', monthlyRate: 5000 },
    ];

    const mockModules: ProjectModule[] = [
      {
        id: 'module-1',
        name: 'Authentication',
        designDays: 5,
        frontendDays: 10,
        backendDays: 8,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer', 'Backend Developer'],
        isEnabled: true,
      },
    ];

    const mockOnToggle = vi.fn();
    const mockOnBulkToggle = vi.fn();
    const mockOnAddModule = vi.fn();

    beforeEach(() => {
      mockOnToggle.mockClear();
      mockOnBulkToggle.mockClear();
      mockOnAddModule.mockClear();
    });

    it('should show Add Module button in ModuleList', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={mockOnToggle}
          onBulkToggle={mockOnBulkToggle}
          onAddModule={mockOnAddModule}
          rates={mockRates}
          currency="$"
        />
      );

      expect(screen.getByRole('button', { name: /add module/i })).toBeInTheDocument();
    });

    it('should open AddModuleForm when Add Module button is clicked', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={mockOnToggle}
          onBulkToggle={mockOnBulkToggle}
          onAddModule={mockOnAddModule}
          rates={mockRates}
          currency="$"
        />
      );

      const addButton = screen.getByRole('button', { name: /add module/i });
      await userEvent.click(addButton);

      // Form should be visible
      expect(screen.getByPlaceholderText(/e.g., user authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/design performers/i)).toBeInTheDocument();
    });

    it('should close AddModuleForm when Cancel is clicked', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={mockOnToggle}
          onBulkToggle={mockOnBulkToggle}
          onAddModule={mockOnAddModule}
          rates={mockRates}
          currency="$"
        />
      );

      // Open form
      const addButton = screen.getByRole('button', { name: /add module/i });
      await userEvent.click(addButton);

      expect(screen.getByPlaceholderText(/e.g., user authentication/i)).toBeInTheDocument();

      // Click cancel button in the form (not the toggle button at the top)
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      // The form's cancel button is the last one (inside the form at the bottom)
      const cancelButton = cancelButtons[cancelButtons.length - 1];
      await userEvent.click(cancelButton);

      // Form should be hidden
      expect(screen.queryByPlaceholderText(/e.g., user authentication/i)).not.toBeInTheDocument();
    });

    it('should submit new module and close form', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={mockOnToggle}
          onBulkToggle={mockOnBulkToggle}
          onAddModule={mockOnAddModule}
          rates={mockRates}
          currency="$"
        />
      );

      // Open form
      const addButton = screen.getByRole('button', { name: /add module/i });
      await userEvent.click(addButton);

      // Fill form
      const nameInput = screen.getByPlaceholderText(/e.g., user authentication/i);
      const numberInputs = screen.getAllByRole('spinbutton');
      const designInput = numberInputs[0];

      await userEvent.type(nameInput, 'New Feature');
      await userEvent.type(designInput, '5');

      // Submit - there are multiple "Add Module" buttons, get the one in the form
      const submitButtons = screen.getAllByRole('button', { name: /add module/i });
      const submitButton = submitButtons[submitButtons.length - 1];
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAddModule).toHaveBeenCalledWith({
          name: 'New Feature',
          designDays: 5,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: [],
          developmentPerformers: [],
        });
      });

      // Form should be hidden after submission
      expect(screen.queryByPlaceholderText(/e.g., user authentication/i)).not.toBeInTheDocument();
    });

    it('should pass available performers from rates to AddModuleForm', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={mockOnToggle}
          onBulkToggle={mockOnBulkToggle}
          onAddModule={mockOnAddModule}
          rates={mockRates}
          currency="$"
        />
      );

      // Open form
      const addButton = screen.getByRole('button', { name: /add module/i });
      await userEvent.click(addButton);

      // Performer selectors should be visible (derived from rates)
      expect(screen.getByText(/design performers/i)).toBeInTheDocument();
      expect(screen.getByText(/development performers/i)).toBeInTheDocument();
    });

    it('should toggle Add Module button text between "Add Module" and "Cancel"', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={mockOnToggle}
          onBulkToggle={mockOnBulkToggle}
          onAddModule={mockOnAddModule}
          rates={mockRates}
          currency="$"
        />
      );

      const addButton = screen.getByRole('button', { name: /add module/i });
      expect(addButton).toHaveTextContent('Add Module');

      await userEvent.click(addButton);

      // Button should now say "Cancel"
      expect(addButton).toHaveTextContent('Cancel');
    });
  });

  describe('Module Pricing with Discounts Integration', () => {
    const mockModules: ProjectModule[] = [
      {
        id: 'module-1',
        name: 'Feature A',
        designDays: 10,
        frontendDays: 20,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      },
    ];

    it('should display module prices with per-performer discounts applied', () => {
      const ratesWithDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000, discount: 50 },
        { role: 'Frontend Developer', monthlyRate: 5000, discount: 20 },
      ];

      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={ratesWithDiscount}
          currency="$"
        />
      );

      // UI Designer: $4000/20 = $200/day, with 50% discount = $100/day × 10 days = $1000
      // Frontend Dev: $5000/20 = $250/day, with 20% discount = $200/day × 20 days = $4000
      // Total: $5000

      expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
    });

    it('should display module prices without discounts', () => {
      const ratesWithoutDiscount: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000 },
        { role: 'Frontend Developer', monthlyRate: 5000 },
      ];

      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={ratesWithoutDiscount}
          currency="$"
        />
      );

      // UI Designer: $200/day × 10 days = $2000
      // Frontend Dev: $250/day × 20 days = $5000
      // Total: $7000

      expect(screen.getByText(/\$7,000/)).toBeInTheDocument();
    });

    it('should show cost percentage for enabled modules', () => {
      const multipleModules: ProjectModule[] = [
        {
          id: 'module-1',
          name: 'Feature A',
          designDays: 10,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
        {
          id: 'module-2',
          name: 'Feature B',
          designDays: 10,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: ['UI Designer'],
          developmentPerformers: [],
          isEnabled: true,
        },
      ];

      const rates: RateConfig[] = [
        { role: 'UI Designer', monthlyRate: 4000 }, // $200/day
      ];

      render(
        <ModuleList
          modules={multipleModules}
          onToggle={vi.fn()}
          rates={rates}
          currency="$"
        />
      );

      // Each module costs $2000, total $4000
      // Each should show 50%
      const percentages = screen.getAllByText(/\(50%\)/);
      expect(percentages).toHaveLength(2);
    });
  });

  describe('Bulk Operations Integration', () => {
    const mockRates: RateConfig[] = [
      { role: 'UI Designer', monthlyRate: 4000 },
    ];

    const mockModules: ProjectModule[] = [
      {
        id: 'module-1',
        name: 'Feature A',
        designDays: 5,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      },
      {
        id: 'module-2',
        name: 'Feature B',
        designDays: 5,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: false,
      },
    ];

    it('should show Enable All and Disable All buttons', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          onBulkToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      expect(screen.getByRole('button', { name: /enable all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /disable all/i })).toBeInTheDocument();
    });

    it('should call onBulkToggle when Enable All is clicked', async () => {
      const mockOnBulkToggle = vi.fn();

      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          onBulkToggle={mockOnBulkToggle}
          rates={mockRates}
          currency="$"
        />
      );

      const enableAllButton = screen.getByRole('button', { name: /enable all/i });
      await userEvent.click(enableAllButton);

      expect(mockOnBulkToggle).toHaveBeenCalledWith(true);
    });

    it('should call onBulkToggle when Disable All is clicked', async () => {
      const mockOnBulkToggle = vi.fn();

      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          onBulkToggle={mockOnBulkToggle}
          rates={mockRates}
          currency="$"
        />
      );

      const disableAllButton = screen.getByRole('button', { name: /disable all/i });
      await userEvent.click(disableAllButton);

      expect(mockOnBulkToggle).toHaveBeenCalledWith(false);
    });
  });

  describe('Module Sorting Integration', () => {
    const mockRates: RateConfig[] = [
      { role: 'UI Designer', monthlyRate: 4000 },
      { role: 'Frontend Developer', monthlyRate: 5000 },
    ];

    const mockModules: ProjectModule[] = [
      {
        id: 'module-1',
        name: 'Zebra Feature',
        designDays: 10,
        frontendDays: 20,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      },
      {
        id: 'module-2',
        name: 'Alpha Feature',
        designDays: 5,
        frontendDays: 10,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: ['Frontend Developer'],
        isEnabled: true,
      },
    ];

    it('should display modules in CSV order by default', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      const moduleNames = screen.getAllByRole('heading', { level: 4 });
      expect(moduleNames[0]).toHaveTextContent('Zebra Feature');
      expect(moduleNames[1]).toHaveTextContent('Alpha Feature');
    });

    it('should sort by name when Name button is clicked', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      const nameButton = screen.getByRole('button', { name: /name/i });
      await userEvent.click(nameButton);

      // After sorting by name, Alpha should come before Zebra
      const moduleNames = screen.getAllByRole('heading', { level: 4 });
      expect(moduleNames[0]).toHaveTextContent('Alpha Feature');
      expect(moduleNames[1]).toHaveTextContent('Zebra Feature');
    });

    it('should show sort direction indicator', async () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      const nameButton = screen.getByRole('button', { name: /name/i });
      await userEvent.click(nameButton);

      // Should show ascending arrow
      expect(nameButton).toHaveTextContent('↑');

      await userEvent.click(nameButton);

      // Should show descending arrow
      expect(nameButton).toHaveTextContent('↓');
    });
  });

  describe('Currency Display Integration', () => {
    const mockRates: RateConfig[] = [
      { role: 'UI Designer', monthlyRate: 4000 },
    ];

    const mockModules: ProjectModule[] = [
      {
        id: 'module-1',
        name: 'Test Module',
        designDays: 10,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      },
    ];

    it('should display prices with $ currency', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      expect(screen.getByText(/\$2,000/)).toBeInTheDocument();
    });

    it('should display prices with € currency', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="€"
        />
      );

      expect(screen.getByText(/€2,000/)).toBeInTheDocument();
    });
  });

  describe('Module Statistics Integration', () => {
    const mockRates: RateConfig[] = [
      { role: 'UI Designer', monthlyRate: 4000 },
    ];

    const mockModules: ProjectModule[] = [
      {
        id: 'module-1',
        name: 'Module A',
        designDays: 5,
        frontendDays: 10,
        backendDays: 8,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      },
      {
        id: 'module-2',
        name: 'Module B',
        designDays: 3,
        frontendDays: 0,
        backendDays: 0,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: true,
      },
      {
        id: 'module-3',
        name: 'Module C (Disabled)',
        designDays: 100,
        frontendDays: 100,
        backendDays: 100,
        designPerformers: ['UI Designer'],
        developmentPerformers: [],
        isEnabled: false,
      },
    ];

    it('should show correct module count', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      // 2 of 3 enabled
      expect(screen.getByText(/2 of 3 enabled/i)).toBeInTheDocument();
    });

    it('should display timeline and effort statistics', () => {
      render(
        <ModuleList
          modules={mockModules}
          onToggle={vi.fn()}
          rates={mockRates}
          currency="$"
        />
      );

      // Timeline: MAX(8, 10, 8) = 10d
      // Effort: 5+10+8 + 3 = 26d
      expect(screen.getByText(/10d timeline/i)).toBeInTheDocument();
      expect(screen.getByText(/26d effort/i)).toBeInTheDocument();
    });
  });
});
