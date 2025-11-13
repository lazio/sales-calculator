import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddModuleForm from '@/components/features/AddModuleForm';

describe('AddModuleForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockAvailablePerformers = ['UI Designer', 'Frontend Developer', 'Backend Developer'];

  // Helper to get inputs by their position
  const getInputs = () => {
    const nameInput = screen.getByPlaceholderText(/e.g., user authentication/i);
    const numberInputs = screen.getAllByRole('spinbutton');
    return {
      nameInput,
      designInput: numberInputs[0],
      frontendInput: numberInputs[1],
      backendInput: numberInputs[2],
    };
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText(/e.g., user authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/effort \(days\)/i)).toBeInTheDocument();
      expect(screen.getByText(/design performers/i)).toBeInTheDocument();
      expect(screen.getByText(/development performers/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add module/i })).toBeInTheDocument();

      // Check that number inputs exist
      const numberInputs = screen.getAllByRole('spinbutton');
      expect(numberInputs).toHaveLength(3); // Design, Frontend, Backend
    });

    it('should render warning when no performers available', () => {
      render(
        <AddModuleForm
          availablePerformers={[]}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/no performers available/i)).toBeInTheDocument();
    });

    it('should have empty string as default value for effort inputs', () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
      const [designInput, frontendInput, backendInput] = inputs;

      expect(designInput.value).toBe('');
      expect(frontendInput.value).toBe('');
      expect(backendInput.value).toBe('');
    });
  });

  describe('Validation', () => {
    it('should show error when module name is empty', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/module name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when all effort days are zero', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput } = getInputs();
      await userEvent.type(nameInput, 'Test Module');

      // Leave all effort fields empty (which converts to 0)
      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least one effort day should be greater than 0/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not show error when at least one effort day is greater than 0', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput, designInput } = getInputs();

      await userEvent.type(nameInput, 'Test Module');
      await userEvent.type(designInput, '5');

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput, designInput, frontendInput, backendInput } = getInputs();

      await userEvent.type(nameInput, 'Authentication Module');
      await userEvent.type(designInput, '5');
      await userEvent.type(frontendInput, '10');
      await userEvent.type(backendInput, '8');

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Authentication Module',
          designDays: 5,
          frontendDays: 10,
          backendDays: 8,
          designPerformers: [],
          developmentPerformers: [],
        });
      });
    });

    it('should convert empty strings to 0 in submission', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput, designInput } = getInputs();

      await userEvent.type(nameInput, 'Test');
      await userEvent.type(designInput, '5');
      // Leave frontend and backend empty

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test',
          designDays: 5,
          frontendDays: 0,
          backendDays: 0,
          designPerformers: [],
          developmentPerformers: [],
        });
      });
    });

    it('should trim whitespace from module name', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput, designInput } = getInputs();

      await userEvent.type(nameInput, '  Test Module  ');
      await userEvent.type(designInput, '5');

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Module', // Trimmed
          })
        );
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset form after successful submission', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput, designInput } = getInputs();

      await userEvent.type(nameInput, 'Test Module');
      await userEvent.type(designInput, '5');

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Check that form is reset
      expect(nameInput.value).toBe('');
      expect(designInput.value).toBe('');
    });

    it('should clear errors after successful submission', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // First, trigger validation error
      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/module name is required/i)).toBeInTheDocument();
      });

      // Now fill form and submit
      const { nameInput, designInput } = getInputs();

      await userEvent.type(nameInput, 'Test Module');
      await userEvent.type(designInput, '5');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Error should be cleared
      expect(screen.queryByText(/module name is required/i)).not.toBeInTheDocument();
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not submit form when cancel is clicked', () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Input Handling', () => {
    it('should update name field on change', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput } = getInputs();
      await userEvent.type(nameInput, 'New Module');

      expect(nameInput.value).toBe('New Module');
    });

    it('should update effort days on change', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { designInput, frontendInput, backendInput } = getInputs();

      await userEvent.type(designInput, '5');
      await userEvent.type(frontendInput, '10');
      await userEvent.type(backendInput, '8');

      expect(designInput.value).toBe('5');
      expect(frontendInput.value).toBe('10');
      expect(backendInput.value).toBe('8');
    });

    it('should not allow negative numbers in effort fields', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { designInput } = getInputs();

      // Try to enter negative number
      fireEvent.change(designInput, { target: { value: '-5' } });

      // Should be converted to 0 (Math.max(0, -5))
      expect(parseInt(designInput.value) >= 0).toBe(true);
    });
  });

  describe('Performer Selection', () => {
    it('should show performer selection dropdowns when performers are available', () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/design performers/i)).toBeInTheDocument();
      expect(screen.getByText(/development performers/i)).toBeInTheDocument();
    });

    it('should not show performer dropdowns when no performers available', () => {
      render(
        <AddModuleForm
          availablePerformers={[]}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // MultiSelect components should not be rendered
      expect(screen.queryByText(/select design team/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/select development team/i)).not.toBeInTheDocument();
    });
  });

  describe('Validation Error Display', () => {
    it('should show name error with red border', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const { nameInput } = getInputs();
        expect(nameInput).toHaveClass('border-destructive');
      });
    });

    it('should show effort days error message', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput } = getInputs();
      await userEvent.type(nameInput, 'Test');

      const submitButton = screen.getByRole('button', { name: /add module/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least one effort day should be greater than 0/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission Prevention', () => {
    it('should prevent form submission on enter key when invalid', async () => {
      render(
        <AddModuleForm
          availablePerformers={mockAvailablePerformers}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const { nameInput } = getInputs();

      // Press enter without filling form
      fireEvent.submit(nameInput.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/module name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
