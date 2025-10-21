# Quick CSV Testing Guide

## Running Automated Tests

```bash
npm test
```

**Expected:** 133/133 tests passing

## Manual Testing with Sample CSVs

### Location
All test CSV files are in: `/test-csvs/`

### Quick Test Sequence

Open the app: http://localhost:5175/sales-calculator/

#### 1. Valid CSV (Should Work ✅)
**File:** `13-valid-comprehensive.csv`
- **Expected:** ✅ Success message "Successfully imported 6 modules"
- **Check:** Modules appear in Project Modules section
- **Check:** New performers added to Monthly Rates

#### 2. Design Only (Should Work ✅)
**File:** `02-design-only.csv`
- **Expected:** ✅ Success message
- **Check:** Development days = 0 for all modules
- **Check:** Only design costs calculated

#### 3. Development Only (Should Work ✅)
**File:** `03-development-only.csv`
- **Expected:** ✅ Success message
- **Check:** Design days = 0 for all modules
- **Check:** Only development costs calculated

#### 4. Decimal Values (Should Work ✅)
**File:** `12-decimal-values.csv`
- **Expected:** ✅ Success message
- **Check:** Decimal precision maintained (5.5 stays 5.5)

#### 5. Special Characters (Should Work ✅)
**File:** `10-special-characters.csv`
- **Expected:** ✅ Success message
- **Check:** Unicode characters display correctly
- **Check:** Emoji display (if supported by font)

#### 6. No Performers (Should Work but $0) ✅
**File:** `06-no-performers.csv`
- **Expected:** ✅ Success message
- **Check:** Total quote = $0 (no performers assigned)
- **Check:** Modules still appear and can be toggled

#### 7. Wrong Structure (Should Fail ❌)
**File:** `01-wrong-structure.csv`
- **Expected:** ❌ Error message about missing columns
- **Should say:** "Missing or invalid 'Design (days)' field"

#### 8. Invalid Data - Negative (Should Fail ❌)
**File:** `07-invalid-data.csv`
- **Expected:** ❌ Error message about invalid data
- **Should say:** "Design days must be a positive number"

#### 9. Missing Module Name (Should Fail ❌)
**File:** `08-missing-module-names.csv`
- **Expected:** ❌ Error message
- **Should say:** "Module name cannot be empty"

#### 10. Large Numbers (Should Fail ❌)
**File:** `09-large-numbers.csv`
- **Expected:** ❌ Error message
- **Should say:** "Design days must be between 0 and 1000"

#### 11. Empty CSV (Should Fail ❌)
**File:** `04-empty.csv`
- **Expected:** ❌ Error message
- **Should say:** "No valid data found in CSV file"

## Error Checking

For each failed import, verify:
- ✅ Error message is displayed in red
- ✅ Error message is clear and actionable
- ✅ Row number is mentioned (if applicable)
- ✅ No modules were imported
- ✅ Previous data not affected

For each successful import, verify:
- ✅ Success message displayed in green
- ✅ Module count shown
- ✅ Modules appear in Project Modules list
- ✅ New performers added to Monthly Rates
- ✅ Quote calculations update

## Feature Testing

After importing `13-valid-comprehensive.csv`:

### Test Module Toggles
- ✅ Click module checkbox - should toggle on/off
- ✅ Total quote updates
- ✅ Timeline recalculates

### Test Bulk Actions
- ✅ "Enable All" button works
- ✅ "Disable All" button works

### Test Sorting
- ✅ Sort by Name
- ✅ Sort by Price
- ✅ Sort by Timeline
- ✅ Sort order toggle (ascending/descending)

### Test Timeline Adjustment
- ✅ Work Overlap slider works
- ✅ Timeline slider works
- ✅ Modules excluded when timeline compressed

### Test Discount (Hidden by Default)
- ✅ Discount section initially hidden
- ✅ Click on price to reveal discount
- ✅ Discount section appears
- ✅ Discount applies correctly

### Test Export
- ✅ "Copy Summary" button works
- ✅ "Copy Markdown" dropdown works
- ✅ Both markdown options work

## Performance Testing

### Large CSV
Create a CSV with 50+ modules:
- Should import in < 2 seconds
- UI should remain responsive
- Calculations should be accurate

### Rapid Imports
Import multiple CSVs in quick succession:
- Should not crash
- Previous data properly replaced
- No memory leaks

## Browser Testing

Test in multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

Check for:
- CSV upload works
- Drag and drop works
- Error messages display
- Success messages display
- Unicode characters render

## Common Issues to Check

### Upload Issues
- File input accepts .csv files only
- Drag and drop accepts .csv files only
- Non-CSV files show error

### Display Issues
- Long module names don't break layout
- Many performers don't overflow
- Large numbers format correctly (commas)

### Calculation Issues
- Zero modules = $0 total
- Design-only = correct design cost
- Dev-only = correct dev cost
- Discount applies to final total only

## Quick Validation Checklist

- [ ] Valid CSV imports successfully
- [ ] Invalid CSV shows clear error
- [ ] Design-only works
- [ ] Development-only works
- [ ] Decimals work
- [ ] Unicode/special chars work
- [ ] Empty performers work (cost = $0)
- [ ] Large numbers rejected (>1000)
- [ ] Negative numbers rejected
- [ ] Text in number fields rejected
- [ ] Empty module names rejected
- [ ] Wrong structure rejected
- [ ] Empty CSV rejected

## Need Help?

See `README.md` for detailed test case descriptions
See `TEST_RESULTS.md` for comprehensive test results
