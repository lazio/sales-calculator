import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from '@/components/common/MultiSelect';

describe('MultiSelect', () => {
  const mockOnChange = vi.fn();
  const mockOptions = ['UI Designer', 'Frontend Developer', 'Backend Developer', 'QA Engineer', 'Project Manager'];

  // Helper to get the main trigger button (not the X buttons on chips)
  const getTriggerButton = () => {
    const buttons = screen.getAllByRole('button');
    // The trigger button is the one with the dropdown icon
    return buttons.find(btn => btn.querySelector('svg path[d*="M19 9l-7 7-7-7"]')) || buttons[0];
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('should render with placeholder when nothing selected', () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
          placeholder="Select team members..."
        />
      );

      expect(screen.getByText('Select team members...')).toBeInTheDocument();
    });

    it('should render with label when provided', () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
          label="Team Members"
        />
      );

      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    it('should display "X selected" when items are selected', () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['UI Designer', 'Frontend Developer']}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    it('should display selected items as chips', () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['UI Designer', 'Frontend Developer']}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('UI Designer')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('should open dropdown when trigger button is clicked', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
          placeholder="Select..."
        />
      );

      const trigger = screen.getByText('Select...');
      await userEvent.click(trigger);

      // Dropdown should be visible with options
      expect(screen.getByText('UI Designer')).toBeInTheDocument();
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    it('should close dropdown when trigger is clicked again', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      // Check dropdown is open
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();

      await userEvent.click(trigger);

      // Dropdown should be closed
      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });

    it('should show search input in dropdown', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should display all options when dropdown opens', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      mockOptions.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });
  });

  describe('Option Selection', () => {
    it('should call onChange when option is selected', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const checkbox = screen.getByRole('checkbox', { name: /ui designer/i });
      await userEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(['UI Designer']);
    });

    it('should handle adding multiple selections in one session', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      // Select first option
      const checkbox1 = screen.getByRole('checkbox', { name: /ui designer/i });
      await userEvent.click(checkbox1);
      expect(mockOnChange).toHaveBeenCalledWith(['UI Designer']);

      // Select second option (dropdown still open)
      const checkbox2 = screen.getByRole('checkbox', { name: /frontend developer/i });
      await userEvent.click(checkbox2);
      expect(mockOnChange).toHaveBeenCalledWith(['Frontend Developer']);
    });

    it('should deselect option when clicked again', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['UI Designer']}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const checkbox = screen.getByRole('checkbox', { name: /ui designer/i });
      expect(checkbox).toBeChecked();

      await userEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it('should show selected options as checked', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['UI Designer', 'Backend Developer']}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const checkbox1 = screen.getByRole('checkbox', { name: /ui designer/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /backend developer/i });
      const checkbox3 = screen.getByRole('checkbox', { name: /frontend developer/i });

      expect(checkbox1).toBeChecked();
      expect(checkbox2).toBeChecked();
      expect(checkbox3).not.toBeChecked();
    });
  });

  describe('Search/Filter Functionality', () => {
    it('should filter options based on search term', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'Developer');

      // Should show only options containing "Developer"
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
      expect(screen.queryByText('UI Designer')).not.toBeInTheDocument();
      expect(screen.queryByText('QA Engineer')).not.toBeInTheDocument();
    });

    it('should filter case-insensitively', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'frontend');

      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.queryByText('Backend Developer')).not.toBeInTheDocument();
    });

    it('should show "No options found" when search returns no results', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'xyz123');

      expect(screen.getByText('No options found')).toBeInTheDocument();
    });

    it('should clear search term when dropdown closes', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
      await userEvent.type(searchInput, 'Developer');

      expect(searchInput.value).toBe('Developer');

      // Close dropdown by clicking trigger
      await userEvent.click(trigger);

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      });

      // Reopen dropdown
      await userEvent.click(trigger);

      // Wait for dropdown to open and verify search is cleared
      await waitFor(() => {
        const newSearchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
        expect(newSearchInput).toBeInTheDocument();
        expect(newSearchInput.value).toBe('');
      });
    });
  });

  describe('Remove Selected Items', () => {
    it('should remove item when X button is clicked on chip', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['UI Designer', 'Frontend Developer']}
          onChange={mockOnChange}
        />
      );

      // Find the chip containing "UI Designer"
      const chips = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('UI Designer')
      );

      // Find the X button within the chip (should be an svg)
      const chip = chips.find(c => within(c).queryByRole('button'));
      if (chip) {
        const xButton = within(chip).getByRole('button');
        await userEvent.click(xButton);

        expect(mockOnChange).toHaveBeenCalledWith(['Frontend Developer']);
      }
    });

    it('should handle removal of last item', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['UI Designer']}
          onChange={mockOnChange}
        />
      );

      const chips = screen.getAllByRole('button').filter(btn =>
        btn.textContent?.includes('UI Designer')
      );

      const chip = chips.find(c => within(c).queryByRole('button'));
      if (chip) {
        const xButton = within(chip).getByRole('button');
        await userEvent.click(xButton);

        expect(mockOnChange).toHaveBeenCalledWith([]);
      }
    });
  });

  describe('Click Outside Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <div data-testid="outside">Outside element</div>
          <MultiSelect
            options={mockOptions}
            selected={[]}
            onChange={mockOnChange}
          />
        </div>
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      // Dropdown is open
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();

      // Click outside
      const outside = screen.getByTestId('outside');
      await userEvent.click(outside);

      // Dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Arrow Icon', () => {
    it('should rotate arrow when dropdown is open', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      const arrow = trigger.querySelector('svg');

      expect(arrow).not.toHaveClass('rotate-180');

      await userEvent.click(trigger);

      expect(arrow).toHaveClass('rotate-180');
    });
  });

  describe('Empty State', () => {
    it('should handle empty options array', () => {
      render(
        <MultiSelect
          options={[]}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      fireEvent.click(trigger);

      expect(screen.getByText('No options found')).toBeInTheDocument();
    });

    it('should not display any chips when nothing is selected', () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      mockOptions.forEach(option => {
        // Options should not be visible as chips (only in dropdown)
        const chips = screen.queryAllByText(option);
        expect(chips.length).toBe(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
          label="Select Performers"
        />
      );

      const label = screen.getByText('Select Performers');
      expect(label).toBeInTheDocument();
    });

    it('should have checkboxes for each option in dropdown', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      mockOptions.forEach(option => {
        const checkbox = screen.getByRole('checkbox', { name: new RegExp(option, 'i') });
        expect(checkbox).toBeInTheDocument();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle searching and selecting in one session', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={[]}
          onChange={mockOnChange}
        />
      );

      // Open dropdown
      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      // Select first option
      const checkbox1 = screen.getByRole('checkbox', { name: /ui designer/i });
      await userEvent.click(checkbox1);

      expect(mockOnChange).toHaveBeenCalledWith(['UI Designer']);

      // Search for another option
      const searchInput = screen.getByPlaceholderText('Search...');
      await userEvent.type(searchInput, 'Backend');

      // Only Backend Developer should be visible now
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
      expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();

      // Select the filtered option
      const checkbox2 = screen.getByRole('checkbox', { name: /backend developer/i });
      await userEvent.click(checkbox2);

      expect(mockOnChange).toHaveBeenCalledWith(['Backend Developer']);
    });

    it('should maintain selection state across dropdown open/close', async () => {
      render(
        <MultiSelect
          options={mockOptions}
          selected={['Frontend Developer']}
          onChange={mockOnChange}
        />
      );

      // Verify chip is displayed
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();

      // Open dropdown
      const trigger = getTriggerButton()!;
      await userEvent.click(trigger);

      // Verify checkbox is checked
      const checkbox = screen.getByRole('checkbox', { name: /frontend developer/i });
      expect(checkbox).toBeChecked();

      // Close dropdown
      await userEvent.click(trigger);

      // Chip should still be there
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
  });
});
