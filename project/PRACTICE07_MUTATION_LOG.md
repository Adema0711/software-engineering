# Practice #07 — Mutation Challenge Log

## Function under test

`checkAvailability` in `src/lib/availability.ts`

Test suite: `src/lib/availability.test.ts` (21 tests, T01–T21)

The test file was **not modified** during any mutation trial. The original implementation was backed up to `availability.ts.bak` before each mutation and restored after each trial.

---

## Baseline results

**Command:** `npx vitest run`

```
Test Files  1 passed (1)
     Tests  21 passed (21)
  Duration  2.32s
```

All 21 tests passed before any mutations were applied.

---

## M1 — Duration boundary mutation

**Description:** Changed the maximum-duration check from `end - start > 120` to `end - start >= 120`, causing bookings of exactly 120 minutes to be rejected instead of allowed.

**File changed:** `src/lib/availability.ts`, line 48

**Diff:**
```
-  if (end - start > 120) {
+  if (end - start >= 120) {
```

**Command:** `npx vitest run`

**Result:** 3 failed, 18 passed (21 total) — **DETECTED**

**Failing tests:**

| Test ID | Assertion | Failure message |
|---|---|---|
| T07 | `expect(result.reasons).toHaveLength(1)` | `expected [ …(2) ] to have a length of 1 but got 2` |
| T08 | `expect(result.available).toBe(true)` | `expected false to be true // Object.is equality` |
| T16 | `expect(result.reasons[0]).toContain('First')` | `expected 'Booking duration cannot exceed 120 mi…' to contain 'First'` |

**Analysis:** T08 is the primary detector — it directly tests the 120-minute boundary (AC2). T07 and T16 are collateral failures: the mutation adds an extra reason to tests where `end - start` happens to be exactly 120 (T07: `1500 - 1380 = 120`; T16: `700 - 580 = 120`), changing the reason count or content. All three are genuine mutation detections, not syntax or setup errors.

**Status:** DETECTED

---

## M2 — Overlap detection mutation

**Description:** Disabled the overlap check by guarding the `if` condition with `false &&`, so that overlapping bookings are incorrectly accepted as available.

**File changed:** `src/lib/availability.ts`, line 60

**Diff:**
```
-      if (intervalsOverlap(start, end, b.start, b.end)) {
+      if (false && intervalsOverlap(start, end, b.start, b.end)) {
```

**Command:** `npx vitest run`

**Result:** 3 failed, 18 passed (21 total) — **DETECTED**

**Failing tests:**

| Test ID | Assertion | Failure message |
|---|---|---|
| T11 | `expect(result.available).toBe(false)` | `expected true to be false // Object.is equality` |
| T16 | `expect(result.available).toBe(false)` | `expected true to be false // Object.is equality` |
| T21 | `expect(result.available).toBe(false)` | `expected true to be false // Object.is equality` |

**Analysis:** All three failures are genuine. T11 directly tests AC4 overlap rejection with a booking that overlaps the existing one (630–690 vs 600–660). T16 tests the same with multiple overlapping bookings. T21 tests data preservation on an overlap rejection — the function returns `available: true` instead of `false`, so the `available` assertion fails before the data-preservation checks are evaluated. No syntax or import errors.

**Status:** DETECTED

---

## M3 — Blocked room bypass mutation

**Description:** Disabled the blocked-room check by guarding the `if` condition with `false &&`, so that a blocked room is incorrectly reported as available.

**File changed:** `src/lib/availability.ts`, line 53

**Diff:**
```
-  if (room.blocked) {
+  if (false && room.blocked) {
```

**Command:** `npx vitest run` (via `npm test`)

**Result:** 1 failed, 20 passed (21 total) — **DETECTED**

**Failing tests:**

| Test ID | Assertion | Failure message |
|---|---|---|
| T10 | `expect(result.available).toBe(false)` | `expected true to be false // Object.is equality` |

**Analysis:** T10 is the sole detector — it is the only test that uses a blocked room. The mutation causes the function to skip the blocked-room reason, so `available` returns `true` instead of `false`. The exact-message assertion (`toBe('This room is currently blocked...')`) would also fail, but Vitest reports the first failing assertion. No other test exercises AC3, so only T10 detects this mutation. No syntax or import errors.

**Status:** DETECTED

---

## Restoration confirmation

After all three mutation trials, the original `availability.ts` was restored from the backup file. The backup was then deleted.

**Restored file verification:** `src/lib/availability.ts` matches the original — line 48 reads `if (end - start > 120)`, line 53 reads `if (room.blocked)`, and line 60 reads `if (intervalsOverlap(start, end, b.start, b.end))`.

---

## Final verification results

**Command:** `npm test` (runs `vitest run`)

```
Test Files  1 passed (1)
     Tests  21 passed (21)
  Duration  2.22s
```

**Command:** `npm run typecheck` (runs `tsc --noEmit -p tsconfig.app.json`)

```
(exit 0, no errors)
```

**Command:** `npm run build` (runs `vite build`)

```
✓ 1574 modules transformed.
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-DLIkqh8-.css   13.38 kB │ gzip:  3.35 kB
dist/assets/index-CTJJ3fTC.js   156.96 kB │ gzip: 49.99 kB
✓ built in 10.10s
```

All 21 tests pass, typecheck is clean, and the build succeeds.

---

## Summary

| Mutation | Description | Tests failed | Status |
|---|---|---|---|
| M1 | `> 120` → `>= 120` (reject 120-min bookings) | T07, T08, T16 | DETECTED |
| M2 | Disable overlap check (`false &&`) | T11, T16, T21 | DETECTED |
| M3 | Disable blocked-room check (`false &&`) | T10 | DETECTED |

All three mutants were detected by the test suite. No mutant survived.
