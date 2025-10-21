# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **CSV Order Preservation** (v1.2.0)
  - Modules now maintain their original CSV import order by default
  - New "CSV Order" sort option (selected by default)
  - Users control module display order through CSV row sequence
  - Enables priority-based, workflow-based, and phase-based ordering
  - 8 new tests for sort order preservation
- Comprehensive CSV edge case testing suite (33 new tests)
  - Test coverage for design-only, development-only, invalid data, special characters, etc.
  - 13 sample CSV files in `/test-csvs/` directory
  - Automated validation tests for all edge cases

- Discount section visibility control
  - Discount section now hidden by default
  - Clicking on the price reveals the discount section
  - Cleaner initial UI

- Work overlap feature
  - Configurable overlap between design and development phases
  - Default: 1 month (20 business days) overlap
  - Granularity: 1 week (5 business days)
  - Timeline calculations respect overlap setting

### Improved
- Module performer display logic (v1.1.0)
  - Design performers only shown when `designDays > 0`
  - Development performers only shown when `frontendDays > 0` OR `backendDays > 0`
  - Cleaner UI for design-only and development-only projects
  - Prevents confusion when performers are assigned but no work exists in that phase

### Technical Details

#### Performer Display Logic
The ModuleList component now checks both:
1. **Has performers** - Performer array is not empty
2. **Has work** - Days for that phase > 0

**Examples:**
- Design-only module (designDays=20, frontendDays=0, backendDays=0)
  - ✅ Shows design performers
  - ❌ Hides development performers (even if they exist in array)

- Development-only module (designDays=0, frontendDays=15, backendDays=20)
  - ❌ Hides design performers (even if they exist in array)
  - ✅ Shows development performers

- Mixed module (designDays=5, frontendDays=8, backendDays=10)
  - ✅ Shows design performers
  - ✅ Shows development performers

#### Test Coverage
- Total tests: 141 (100% passing)
- New performer display tests: 8
- CSV import edge case tests: 33
- Existing tests: 100

## Testing

### Automated Tests
```bash
npm test
```

### Manual Testing with Edge Case CSVs
See `/test-csvs/QUICK_TEST_GUIDE.md` for step-by-step testing instructions.

**Sample Test Cases:**
1. Import `02-design-only.csv` - Should only show design performers
2. Import `03-development-only.csv` - Should only show development performers
3. Import `13-valid-comprehensive.csv` - Should show both when applicable

## Files Changed

### ModuleList Component
**File:** `src/components/features/ModuleList.tsx`

**Changes:**
- Updated performer display condition from:
  ```tsx
  {module.designPerformers.length > 0 && (...)}
  ```

  To:
  ```tsx
  {module.designDays > 0 && module.designPerformers.length > 0 && (...)}
  ```

- Updated development performers condition from:
  ```tsx
  {module.developmentPerformers.length > 0 && (...)}
  ```

  To:
  ```tsx
  {(module.frontendDays > 0 || module.backendDays > 0) && module.developmentPerformers.length > 0 && (...)}
  ```

### Test Files
- Added: `src/test/moduleListPerformers.test.tsx` - 8 tests for performer display logic
- Added: `src/test/csvImport.test.ts` - 33 tests for CSV import edge cases
- Added: 13 test CSV files in `/test-csvs/` directory

## Migration Notes

No breaking changes. This is a UI improvement that:
- ✅ Maintains backward compatibility
- ✅ All existing tests pass
- ✅ No API changes
- ✅ No database changes
- ✅ No configuration changes required

## Benefits

1. **Cleaner UI** - No irrelevant performer badges shown
2. **Less Confusion** - Clear which team members are actually working
3. **Better UX** - Design-only and dev-only projects display appropriately
4. **Consistency** - UI matches the actual work being done

## Edge Cases Handled

✅ Design-only modules (0 development days)
✅ Development-only modules (0 design days)
✅ Frontend-only modules (0 backend days)
✅ Backend-only modules (0 frontend days)
✅ Mixed modules (all phases have work)
✅ Empty performer arrays
✅ Modules with all zeros (placeholder modules)

## Related Documentation

- `/test-csvs/README.md` - Description of all test CSV files
- `/test-csvs/TEST_RESULTS.md` - Comprehensive test results
- `/test-csvs/QUICK_TEST_GUIDE.md` - Manual testing guide
