# Practice #08 — Defect Log

This log tracks defects discovered or introduced during Practice #08.
At baseline, no defects exist — all 21 tests pass, typecheck is clean, and the
build succeeds. Rows will be populated as bugs are introduced and investigated
in subsequent tasks.

## Acceptance Criteria

| AC   | Description                                                                                  |
|------|----------------------------------------------------------------------------------------------|
| AC1  | Reject start >= end and requests in the past (start <= currentTime).                        |
| AC2  | Maximum booking duration is 120 minutes (end − start <= 120).                              |
| AC3  | Reject blocked rooms (room.blocked === true).                                               |
| AC4  | Reject overlapping bookings, but allow touching endpoints (startA < endB && startB < endA). |
| AC5  | Return availability without modifying booking data (pure check, no mutation).               |
| AC6  | Preserve clear UI feedback on desktop and mobile (reasons surfaced to the user).            |

## Defect Log

| Bug ID | Test ID | Input | Expected result | Actual result | Suspected root cause | Status |
|--------|---------|-------|-----------------|---------------|----------------------|--------|
| BUG-A  | T08     | Room: bookings=[{start:600,end:660}]; request start=660, end=780, currentTime=540 | Available (120-min booking, starts exactly when existing ends — touching endpoint) | Unavailable — `result.available` is `false` | `intervalsOverlap` uses `<=` instead of `<`, so touching endpoints are treated as overlapping | Reproduced |
| BUG-A  | T13     | Room: bookings=[{start:600,end:660}]; request start=660, end=720, currentTime=540 | Available (start touches existing end) | Unavailable — `result.available` is `false` | Same `<=` defect in `intervalsOverlap` | Reproduced |
| BUG-A  | T15     | Room: bookings=[{start:600,end:660}]; request start=541, end=600, currentTime=540 | Available (end touches existing start) | Unavailable — `result.available` is `false` | Same `<=` defect in `intervalsOverlap` | Reproduced |
| BUG-A  | T22     | Room: bookings=[{start:720,end:780,title:"Noon Meeting"}]; request start=780, end=840, currentTime=600 | Available (13:00–14:00 touches 12:00–13:00 at endpoint 780) | Unavailable — `result.available` is `false` | Same `<=` defect in `intervalsOverlap` | Isolated |
| BUG-B  | T14     | Room: bookings=[{id:'x1',start:600,end:660}]; request start=660, end=720, currentTime=540 | Bookings array unchanged (length 1) | Bookings array mutated — extra entry `{id:'pending',start:660,end:720}` appended (length 2) | `checkAvailability` pushes a synthetic 'pending' booking into `room.bookings` | Fixed |
| BUG-B  | T21     | Room: bookings=[{id:'x1',start:600,end:660}]; request start=630, end=690, currentTime=540 | Bookings array unchanged (length 1) | Bookings array mutated — extra entry `{id:'pending',start:630,end:690}` appended (length 2) | Same mutation defect in `checkAvailability` | Fixed |
| BUG-B  | T23     | Room: bookings=[{id:'r1',start:600,end:660},{id:'r2',start:720,end:780}]; request start=660, end=720, currentTime=540 | Bookings array unchanged (length 2), result `{available:true,reasons:[]}`, array reference preserved | Bookings array mutated — extra entry `{id:'pending',start:660,end:720}` appended (length 3) | Same mutation defect in `checkAvailability` | Fixed |

## BUG-A — Detailed Analysis

### Defect

In `src/lib/availability.ts`, the `intervalsOverlap` function was changed from:

```ts
return startA < endB && startB < endA;
```

to:

```ts
return startA <= endB && startB <= endA;
```

### Root Cause

The overlap check uses strict inequality (`<`) so that two bookings sharing only an
endpoint — e.g. one ending at 13:00 and the next starting at 13:00 — are treated as
non-overlapping (allowed). By replacing `<` with `<=`, the condition becomes true
for touching intervals, so bookings that merely meet at a boundary are incorrectly
rejected as conflicts.

### Affected Tests

| Test ID | Scenario | Failing assertion |
|---------|----------|-------------------|
| T08 | 120-min booking starting at existing end (660→780) | `expect(result.available).toBe(true)` → received `false` |
| T13 | Start touches existing end (660→720 vs existing 600→660) | `expect(result.available).toBe(true)` → received `false` |
| T15 | End touches existing start (541→600 vs existing 600→660) | `expect(result.available).toBe(true)` → received `false` |
| T22 | Regression: 13:00–14:00 touches 12:00–13:00 at 780 | `expect(result.available).toBe(true)` → received `false` |

### Test Run Summary (with BUG-A present)

```
Test Files  1 failed (1)
     Tests  4 failed | 18 passed (22)
```

Exit code: 1.

### Proposed Fix (NOT yet applied)

Restore the strict inequality in `intervalsOverlap`:

```ts
return startA < endB && startB < endA;
```

This single change reverts the function to the correct behavior where touching
endpoints are allowed.

**Status: Isolated.** BUG-A has been temporarily reverted to the correct
implementation (`startA < endB && startB < endA`) so that BUG-B can be
reproduced independently. The clean copy of the correct `availability.ts` is
preserved in `src/lib/availability.ts.clean` and `src/lib/availability.ts.baseline`.
BUG-A evidence (failing tests T08, T13, T15, T22) remains documented above.

## BUG-B — Detailed Analysis

### Defect

In `src/lib/availability.ts`, the following line was added at the end of
`checkAvailability`, just before the return statement:

```ts
room.bookings.push({ id: 'pending', start, end, title: 'Pending', bookedBy: 'System' });
```

### Root Cause

`checkAvailability` is a pure query function — it must check whether a room is
available without modifying the room or its bookings. By calling
`room.bookings.push(...)`, the function appends a synthetic 'pending' booking to
the caller's original array on every invocation. This violates AC5 (return
availability without modifying booking data) and causes side effects that
corrupt the room's state for any subsequent check.

### Affected Tests

| Test ID | Scenario | Failing assertion |
|---------|----------|-------------------|
| T14 | Bookings unchanged after a valid availability check (660→720) | `expect(room.bookings).toEqual(originalBookings)` → received array with extra `{id:'pending',...}` entry |
| T21 | Bookings unchanged after an overlap rejection (630→690) | `expect(room.bookings).toEqual(originalBookings)` → received array with extra `{id:'pending',...}` entry |
| T23 | Regression: fresh room with 2 bookings, check 660→720, expect no mutation | `expect(room.bookings).toEqual(originalBookings)` → received array with extra `{id:'pending',...}` entry (length 3 vs 2) |

### Test Run Summary (with BUG-B present, BUG-A isolated)

```
Test Files  1 failed (1)
     Tests  3 failed | 20 passed (23)
```

Exit code: 1.

### Proposed Fix (NOT yet applied)

Remove the `room.bookings.push(...)` line from `checkAvailability`. The function
should only read `room.bookings` for overlap detection and must never mutate it.

**Fix Applied: BUG-B resolved.**

The `room.bookings.push(...)` statement and its comment were removed from
`checkAvailability` in `src/lib/availability.ts`. The function now returns the
availability result without modifying the room's booking array.

T23 was strengthened to assert:
- `result.available` is `true`
- `result.reasons` is `[]`
- `room.bookings` is the same array reference (`toBe`)
- `room.bookings` deeply equals the original bookings (`toEqual`)
- `room.bookings` has length 2

### Verification (all executed after fix)

**Targeted T23 test:**
```
RUN  v2.1.9 /home/project
 ✓ src/lib/availability.test.ts (23 tests | 22 skipped) 3ms
 Test Files  1 passed (1)
      Tests  1 passed | 22 skipped (23)
```

**Full Vitest suite:**
```
RUN  v2.1.9 /home/project
 ✓ src/lib/availability.test.ts (23 tests) 14ms
 Test Files  1 passed (1)
      Tests  23 passed (23)
```

**Typecheck:** clean (exit 0)

**Build:** success, 1,574 modules transformed (exit 0)

## Status Legend

- **Open** — Defect not yet addressed.
- **Investigating** — Root cause being analyzed.
- **Reproduced** — Defect confirmed via failing tests; not yet fixed.
- **Isolated** — Defect temporarily reverted so another defect can be tested independently.
- **Fixed** — Defect resolved and verified by tests.
- **Wontfix** — Defect acknowledged but not addressed (with justification).

## Preserving a Clean Baseline

Two recommended strategies for keeping the baseline safe while experimenting:

1. **Git (preferred).** Initialize a repository (`git init`), commit the current
   working state on `main`, then create a feature branch (`git checkout -b
   practice-08-bugs`) before introducing any defects. If something goes wrong,
   `git checkout main` restores the clean baseline instantly. Tag the baseline
   for extra safety: `git tag baseline-green`.

2. **Separate copy.** If Git is unavailable, duplicate the entire project folder
   before making changes (e.g. `cp -r ../project ../project-baseline`). All
   experimentation happens in the working copy; the backup folder remains
   untouched and can be restored at any time.

In either case, **never edit the baseline after it is captured**. All defect
introduction, investigation, and fixing happens on a branch or in a copy so the
green baseline is always recoverable.
