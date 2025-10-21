# CSV Edge Case Test Suite

This directory contains various CSV files to test edge cases in the CSV import functionality.

## Test Files

### 1. `01-wrong-structure.csv`
**Purpose:** Test CSV with incorrect column names
- Missing required columns: "Design (days)", "Front-end (days)", "Back-end (days)"
- Has wrong columns: "Feature", "Days", "Notes"
- **Expected behavior:** Should fail validation with error message about missing required columns

### 2. `02-design-only.csv`
**Purpose:** Test modules with only design work, no development
- All modules have design days > 0
- All modules have frontend and backend = 0
- **Expected behavior:** Should import successfully, calculate costs only for design phase

### 3. `03-development-only.csv`
**Purpose:** Test modules with only development work, no design
- All modules have design days = 0
- All modules have frontend and/or backend > 0
- **Expected behavior:** Should import successfully, calculate costs only for development phase

### 4. `04-empty.csv`
**Purpose:** Test CSV with only headers, no data rows
- Valid structure but no modules
- **Expected behavior:** Should show error "No valid data found in CSV file"

### 5. `05-completely-empty.csv`
**Purpose:** Test completely empty CSV file
- No headers, no data
- **Expected behavior:** Should fail to parse or show appropriate error

### 6. `06-no-performers.csv`
**Purpose:** Test CSV with valid structure but no performers assigned
- All performer columns are empty
- **Expected behavior:** Should import successfully but cost calculation should be $0

### 7. `07-invalid-data.csv`
**Purpose:** Test CSV with invalid numeric data
- Negative numbers: -5, -8
- Text in numeric fields: "seven", "abc"
- Mix of valid and invalid rows
- **Expected behavior:** Should fail with validation error on first invalid row

### 8. `08-missing-module-names.csv`
**Purpose:** Test CSV with empty module names
- Some rows have empty Module field
- **Expected behavior:** Should fail validation with "Module name cannot be empty"

### 9. `09-large-numbers.csv`
**Purpose:** Test CSV with very large day values
- Values like 1000, 2000, 999999 days
- **Expected behavior:** Should fail validation (max is 1000 days per validation rules)

### 10. `10-special-characters.csv`
**Purpose:** Test CSV with special characters and Unicode
- Unicode characters (中文, デザイナー, Développeur)
- Special characters (&, /, (), emoji)
- Parentheses in performer names
- **Expected behavior:** Should handle special characters gracefully

### 11. `11-mixed-valid-invalid.csv`
**Purpose:** Test CSV with mix of valid and invalid rows
- Some rows valid, some invalid (negative, text in numbers)
- **Expected behavior:** Should fail on first invalid row

### 12. `12-decimal-values.csv`
**Purpose:** Test CSV with decimal/fractional day values
- Values like 5.5, 8.75, 10.25
- **Expected behavior:** Should accept decimals and parse correctly

### 13. `13-valid-comprehensive.csv`
**Purpose:** Control test - completely valid CSV
- Multiple modules with varying complexity
- Multiple performers per phase
- Mix of design and development work
- **Expected behavior:** Should import successfully with correct calculations

## Testing Procedure

1. Open the application at http://localhost:5175/sales-calculator/
2. For each CSV file:
   - Click "Choose CSV File" or drag and drop the CSV
   - Observe the result (success message or error)
   - Check if modules are imported correctly
   - Verify calculations are accurate
   - Check if new performer rates are added as needed
3. Document any unexpected behaviors or bugs

## Expected Validation Rules (from code)

Based on `src/utils/validation.ts`:
- Module name: Cannot be empty (after trim)
- Design days: Must be 0-1000
- Frontend days: Must be 0-1000
- Backend days: Must be 0-1000
- All day fields: Must be valid numbers (including decimals)
- Negative values: Should be rejected
