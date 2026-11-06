# Practice #08 — BUG-B Fix Report

## Summary

BUG-B caused `checkAvailability` to mutate the caller's `room.bookings` array by
pushing a synthetic "pending" booking on every call, violating AC5. The fix
removes the single offending statement. No other logic was changed.

---

## Minimal Code Diff

### `src/lib/availability.ts`

```diff
   }

-  // BUG-B: mutates the original room.bookings array during availability checking
-  room.bookings.push({ id: 'pending', start, end, title: 'Pending', bookedBy: 'System' });
-
   return { available: reasons.length === 0, reasons };
 }
```

### `src/lib/availability.test.ts` — T23 strengthened

```diff
     const originalBookings = structuredClone(room.bookings);
+    const bookingsRef = room.bookings;

-    checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
+    const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);

+    expect(result.available).toBe(true);
+    expect(result.reasons).toEqual([]);
+    expect(room.bookings).toBe(bookingsRef);
     expect(room.bookings).toEqual(originalBookings);
     expect(room.bookings).toHaveLength(2);
```

Added assertions:
- `result.available` is `true` (correct availability verdict)
- `result.reasons` is `[]` (no rejection reasons)
- `room.bookings` is the same array reference (`toBe`) — not replaced or cloned

---

## Actual Test Results

### Targeted T23 test (`npx vitest run -t "T23"`)

```
 RUN  v2.1.9 /home/project

 ✓ src/lib/availability.test.ts (23 tests | 22 skipped) 3ms

 Test Files  1 passed (1)
      Tests  1 passed | 22 skipped (23)
   Start at  14:08:20
   Duration  332ms (transform 39ms, setup 0ms, collect 37ms, tests 3ms, environment 0ms, prepare 189ms)
```

Result: T23 passed. Exit code: 0.

### Full Vitest suite (`npx vitest run`)

```
 RUN  v2.1.9 /home/project

 ✓ src/lib/availability.test.ts (23 tests) 14ms

 Test Files  1 passed (1)
      Tests  23 passed (23)
   Start at  14:08:21
   Duration  300ms (transform 52ms, setup 0ms, collect 49ms, tests 14ms, environment 0ms, prepare 125ms)
```

Result: 23/23 passed, 0 failures. Exit code: 0.

### Typecheck (`npm run typecheck`)

```
> vite-react-typescript-starter@0.0.0 typecheck
> tsc --noEmit -p tsconfig.app.json
```

Result: clean, no type errors. Exit code: 0.

### Build (`npm run build`)

```
> vite-react-typescript-starter@0.0.0 build
> vite build

vite v5.4.8 building for production...
transforming...
Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 1574 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-DLIkqh8-.css   13.38 kB │ gzip:  3.35 kB
dist/assets/index-CTJJ3fTC.js   156.96 kB │ gzip: 49.99 kB
✓ built in 2.07s
```

Result: build succeeded. Exit code: 0.

---

## Verification Summary

| Check       | Result        |
|-------------|---------------|
| T23 targeted | 1/1 passed   |
| Full Vitest  | 23/23 passed |
| Typecheck    | Clean         |
| Build        | Success       |

---

## Remaining Limitations

- **BUG-A is documented but not re-introduced.** The overlap condition remains
  the correct strict inequality (`startA < endB && startB < endA`). BUG-A's
  evidence and proposed fix are recorded in `PRACTICE08_DEFECT_LOG.md` under
  status "Isolated." If BUG-A needs to be re-introduced for further practice,
  change the `<` operators back to `<=` in `intervalsOverlap`.

- **Backup files remain.** `src/lib/availability.ts.baseline` and
  `src/lib/availability.ts.clean` are preserved copies of the correct
  implementation. They can be removed once Practice #08 is fully complete.

- **No UI-level testing.** AC6 (clear UI feedback on desktop and mobile) is not
  verified by automated tests — only the availability logic is tested. The UI
  components (`ResultBanner`, `RoomSelector`, `TimeInputs`, `Timeline`) were not
  modified and their behavior remains unverified by this test suite.

- **Tests do not cover concurrency.** If `checkAvailability` were called
  concurrently on the same room object, there is no guarantee the bookings array
  would not be modified between calls. The fix removes the mutation, but the
  function does not lock or snapshot the array.
