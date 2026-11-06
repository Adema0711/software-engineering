# Practice #07 — Test Plan for `checkAvailability`

## Scope

This document defines a test plan for the `checkAvailability` function located in `src/lib/availability.ts`. No tests have been executed yet. This plan will be used in a later task to implement and run the test suite.

## Function under test

| Field | Value |
|---|---|
| File | `src/lib/availability.ts` |
| Function | `checkAvailability(room, start, end, currentTime)` |
| Returns | `{ available: boolean; reasons: string[] }` |

## Default test fixture

Unless a test overrides a field, all tests use this fixture:

| Field | Value | Notes |
|---|---|---|
| `room.blocked` | `false` | Room is not blocked |
| `room.bookings` | `[{ id: 'x1', start: 600, end: 660, title: 'Existing', bookedBy: 'Tester' }]` | One existing booking 10:00–11:00 |
| `currentTime` | `540` | "Now" is 09:00 |
| `start` / `end` | varies per test | Minutes from midnight |

> **Important distinction:** The UI in `src/App.tsx` hardcodes `CURRENT_TIME_MIN = 600` (10:00). The test fixture above uses `currentTime = 540` (09:00) as specified by the Practice #07 assignment default. These are two independent values. The helper function accepts `currentTime` as a parameter, so tests control it directly and do not depend on the UI constant.

## Acceptance criteria reference

| AC | Rule |
|---|---|
| AC1 | Interval bounds: `0 <= start < end <= 1440` |
| AC1b | Start time must be strictly after `currentTime` (no past or "now" bookings) |
| AC2 | Booking duration cannot exceed 120 minutes |
| AC3 | Room must not be blocked |
| AC4 | Must not overlap existing bookings (touching endpoints allowed) |
| AC5 | Existing booking data must remain unchanged after checking |
| AC6 | Helper is separated from UI and independently testable |

## Test cases

### T01 — Valid future booking, no overlap

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 720 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: true, reasons: [] }` |
| **Checks** | AC1, AC1b, AC2, AC3, AC4 — all pass for an 11:00–12:00 booking after the existing one |

### T02 — Start time equal to current time

| Field | Value |
|---|---|
| `start` | 540 |
| `end` | 600 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "Start time must be after the current time"] }` |
| **Checks** | AC1b — start must be strictly after currentTime |

### T03 — Start time before current time

| Field | Value |
|---|---|
| `start` | 480 |
| `end` | 540 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "Start time must be after the current time"] }` |
| **Checks** | AC1b — booking in the past is rejected |

### T04 — Start time equal to end time

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 660 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "End time must be after start time"] }` |
| **Checks** | AC1 — zero-length interval is invalid (`start < end` fails) |

### T05 — Start time greater than end time

| Field | Value |
|---|---|
| `start` | 720 |
| `end` | 660 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "End time must be after start time"] }` |
| **Checks** | AC1 — inverted interval is invalid |

### T06 — Start below 0

| Field | Value |
|---|---|
| `start` | -30 |
| `end` | 60 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "End time must be after start time"] }` |
| **Checks** | AC1 — start must be >= 0 |

### T07 — End greater than 1440

| Field | Value |
|---|---|
| `start` | 1380 |
| `end` | 1500 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "End time must be after start time"] }` |
| **Checks** | AC1 — end must be <= 1440 |

### T08 — Duration exactly 120 minutes (allowed)

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 780 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: true, reasons: [] }` |
| **Checks** | AC2 — boundary: 120 minutes is allowed; also passes AC1, AC1b, AC3, AC4 |

### T09 — Duration 121 minutes (rejected)

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 781 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "Booking duration cannot exceed 120 minutes"] }` |
| **Checks** | AC2 — 121 minutes exceeds the 120-minute limit |

### T10 — Blocked room

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 720 |
| `currentTime` | 540 |
| `room.blocked` | true |
| `room.bookings` | default |
| **Expected** | `{ available: false, reasons: [contains "blocked"] }` |
| **Checks** | AC3 — blocked rooms are always unavailable |

### T11 — Overlapping existing booking

| Field | Value |
|---|---|
| `start` | 630 |
| `end` | 690 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default (600–660) |
| **Expected** | `{ available: false, reasons: [contains "Overlaps existing booking"] }` |
| **Checks** | AC4 — 630–690 overlaps 600–660 |

### T12 — Proposed booking ends exactly when existing booking starts (touching)

| Field | Value |
|---|---|
| `start` | 540 |
| `end` | 600 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default (600–660) |
| **Expected** | `{ available: false, reasons: [contains "Start time must be after the current time"] }` |
| **Checks** | AC1b — although end=600 touches the existing booking's start (no AC4 overlap), the start time equals currentTime, so AC1b rejects first |
| **Note** | To isolate the touching-endpoint rule, see T13 which uses a valid future start |

### T13 — Proposed booking starts exactly when existing booking ends (touching)

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 720 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default (600–660) |
| **Expected** | `{ available: true, reasons: [] }` |
| **Checks** | AC4 — touching endpoints are allowed; start=660 equals existing end=660, no overlap |

### T14 — Existing booking data remains unchanged after checking

| Field | Value |
|---|---|
| `start` | 660 |
| `end` | 720 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default |
| **Expected** | After calling `checkAvailability`, the `room.bookings` array and each booking object's `start`, `end`, `title`, `bookedBy`, and `id` are identical to their pre-call values (deep equality) |
| **Checks** | AC5 — the function must be pure; it must not mutate the room or its bookings |

### T15 — Proposed booking ends exactly when existing starts, with valid future start (touching endpoint, isolated)

| Field | Value |
|---|---|
| `start` | 541 |
| `end` | 600 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | default (600–660) |
| **Expected** | `{ available: true, reasons: [] }` |
| **Checks** | AC4 — end=600 touches existing start=600; no overlap; start=541 is after currentTime=540; duration=59 min <= 120 |
| **Rationale** | T12 could not isolate the touching-endpoint rule because AC1b fired first. T15 uses start=541 (one minute after currentTime) to isolate the AC4 touching-endpoint boundary on the "ends-when-existing-starts" side. |

### T16 — Multiple overlapping bookings: first overlap is reported, loop does not continue

| Field | Value |
|---|---|
| `start` | 580 |
| `end` | 700 |
| `currentTime` | 540 |
| `room.blocked` | false |
| `room.bookings` | `[{ start: 600, end: 660, title: 'First', ... }, { start: 650, end: 750, title: 'Second', ... }]` |
| **Expected** | `{ available: false, reasons: [contains "First"] }` — exactly one overlap reason, referencing the first matching booking |
| **Checks** | AC4 — the loop `break`s on the first overlap; only one reason is pushed even when multiple bookings overlap |
| **Rationale** | Verifies the early-exit behavior of the overlap loop and confirms the reason message identifies the correct booking. |

## Summary

| ID | Scenario | Expected | AC |
|---|---|---|---|
| T01 | Valid future booking, no overlap | available | AC1, AC1b, AC2, AC3, AC4 |
| T02 | Start == currentTime | unavailable | AC1b |
| T03 | Start < currentTime | unavailable | AC1b |
| T04 | Start == end | unavailable | AC1 |
| T05 | Start > end | unavailable | AC1 |
| T06 | Start < 0 | unavailable | AC1 |
| T07 | End > 1440 | unavailable | AC1 |
| T08 | Duration == 120 min | available | AC2 boundary |
| T09 | Duration == 121 min | unavailable | AC2 |
| T10 | Blocked room | unavailable | AC3 |
| T11 | Overlapping booking | unavailable | AC4 |
| T12 | End touches existing start (start == now) | unavailable (AC1b fires first) | AC1b |
| T13 | Start touches existing end | available | AC4 |
| T14 | Bookings unchanged after check | no mutation | AC5 |
| T15 | End touches existing start (valid future start) | available | AC4 |
| T16 | First overlap reported, loop breaks | unavailable (one reason) | AC4 |

## Status

No tests have been executed. This plan will be implemented in a subsequent task.
