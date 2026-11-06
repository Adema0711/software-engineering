# Practice #07 — Manual UI Verification Checklist

## Environment

- **App:** Smart Campus Room Checker
- **Current campus time (hardcoded in UI):** 10:00 (600 minutes from midnight)
- **Rooms available in the UI:**
  - **A101 — Lecture Hall A** (Engineering Block, capacity 120, not blocked)
    - Bookings: 09:00–10:30 (Data Structures 101), 12:00–13:00 (Faculty Meeting), 15:00–17:00 (Robotics Workshop)
  - **B204 — Lab B-204** (Science Wing, capacity 30, not blocked)
    - Bookings: 08:00–09:00 (Chemistry Lab), 13:00–15:00 (Physics Practical)
  - **C310 — Seminar Room C-310** (Humanities Center, capacity 20, **blocked**)
    - Bookings: 10:00–11:00 (Maintenance Slot)
  - **D105 — Study Lounge D-105** (Library, capacity 8, not blocked)
    - Bookings: 10:00–12:00 (Group Project), 14:00–16:00 (Book Club)
- **Default time inputs:** Start 11:00, End 12:00
- **Time input type:** HTML `<input type="time">` — browser-native picker, outputs HH:MM

## Browser interaction status

Browser interaction is **not available** in this environment. All scenarios below are marked **Not verified**. The steps are precise enough for a human to execute in Bolt's preview pane.

---

## UI01 — Valid future booking displays Available

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Select room **A101 — Lecture Hall A**. 3. Set Start time to **13:30**. 4. Set End time to **14:00**. 5. Click "Check Availability". |
| **Input values** | Room: A101, Start: 13:30, End: 14:00 |
| **Expected visible result** | Green banner with "Available" heading and message "This time slot is free. You can proceed to book it through the campus portal." The timeline shows a blue candidate slot at 13:30–14:00 with no overlap. |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** 13:30–14:00 is after the current time (10:00), does not overlap any A101 booking (existing: 09:00–10:30, 12:00–13:00, 15:00–17:00), duration is 30 min (≤120), and the room is not blocked. All acceptance criteria pass.

---

## UI02 — Overlapping booking displays Unavailable with feedback

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Select room **A101 — Lecture Hall A**. 3. Set Start time to **12:30**. 4. Set End time to **13:30**. 5. Click "Check Availability". |
| **Input values** | Room: A101, Start: 12:30, End: 13:30 |
| **Expected visible result** | Red banner with "Unavailable" heading and a bullet point reading: "Overlaps existing booking "Faculty Meeting" (12:00–13:00)." The timeline shows the blue candidate slot overlapping the grey "Faculty Meeting" booking. |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** 12:30–13:30 overlaps the existing 12:00–13:00 booking. AC4 should reject with a reason naming the conflicting booking.

---

## UI03 — Blocked room displays Unavailable

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Select room **C310 — Seminar Room C-310** (it has a red "Blocked" badge). 3. Leave Start time at **11:00**. 4. Leave End time at **12:00**. 5. Click "Check Availability". |
| **Input values** | Room: C310, Start: 11:00, End: 12:00 |
| **Expected visible result** | Red banner with "Unavailable" heading and a bullet point reading: "This room is currently blocked and unavailable for booking." The timeline shows a red "Room Blocked" overlay. |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** C310 has `blocked: true`. AC3 should reject regardless of time validity. The room card also shows a red "Blocked" badge in the selector.

---

## UI04 — Invalid/malformed times display validation feedback

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Select room **A101 — Lecture Hall A**. 3. Clear the Start time field and type **25:00** (or enter an invalid value). 4. Set End time to **12:00**. 5. Click "Check Availability". |
| **Input values** | Room: A101, Start: 25:00 (invalid), End: 12:00 |
| **Expected visible result** | Red banner with "Unavailable" heading and a bullet point reading: "Please enter valid times in HH:MM format." (The HTML time input may also prevent entry of 25:00 — if so, try clearing the field entirely and clicking Check, which should produce the same validation message.) |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** `hhmmToMinutes('25:00')` returns `null` because hour 25 > 23. The `handleCheck` function in App.tsx checks for `null` and sets a custom validation message before `checkAvailability` is called. Note: the `<input type="time">` element may clamp or reject values outside 00:00–23:59 at the browser level, so the alternate step (empty field) ensures the validation path is exercised.

**Alternative step if browser blocks invalid times:** Clear the Start time field completely (leave it empty), leave End at 12:00, and click "Check Availability". An empty string also produces `null` from `hhmmToMinutes`, triggering the same validation message.

---

## UI05 — Booking longer than 120 minutes is rejected

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Select room **A101 — Lecture Hall A**. 3. Set Start time to **13:00**. 4. Set End time to **15:30**. 5. Click "Check Availability". |
| **Input values** | Room: A101, Start: 13:00, End: 15:30 |
| **Expected visible result** | Red banner with "Unavailable" heading and a bullet point reading: "Booking duration cannot exceed 120 minutes." (Duration is 150 minutes.) There may also be an overlap reason for the 15:00–17:00 Robotics Workshop, but the duration reason should appear. |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** 13:00–15:30 is 150 minutes, exceeding the 120-minute limit (AC2). The slot also partially overlaps the 15:00–17:00 booking, but AC2 fires independently and produces its own reason. To isolate AC2 without overlap, use Start 13:00 and End 15:15 (135 min, no overlap with the 15:00 booking since 15:15 > 15:00 — actually this does overlap). For a clean AC2-only test, use room **B204** with Start 09:30 and End 12:00 (150 min, no overlap with 08:00–09:00 or 13:00–15:00).

**Cleaner alternative:** Room B204, Start 09:30, End 12:00. Duration = 150 min. No overlap with existing bookings (08:00–09:00 and 13:00–15:00). Expected: only "Booking duration cannot exceed 120 minutes."

---

## UI06 — Result area remains readable at narrow/mobile viewport

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Narrow the browser window to approximately 375px wide (mobile width) or use dev tools device simulation (iPhone SE). 3. Select room **A101 — Lecture Hall A**. 4. Set Start to **13:30**, End to **14:00**. 5. Click "Check Availability". 6. Check that the green "Available" banner, room cards, time inputs, and timeline all remain readable without horizontal scrolling or text overflow. 7. Repeat with an Unavailable result (e.g., room A101, Start 12:30, End 13:30) and confirm the red banner and bullet-point reasons are readable. |
| **Input values** | Viewport: 375px width. Two sub-checks: one Available, one Unavailable. |
| **Expected visible result** | All elements fit within the viewport. The room selector grid stacks to one column. Time inputs stack to one column. The result banner text wraps cleanly. The timeline remains visible with hour labels. No horizontal scrollbar. |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** The layout uses `max-w-3xl` with responsive `sm:` breakpoints. Room selector and time inputs use `sm:grid-cols-2` which collapses to one column on mobile. The result banner uses padding and flex layout that should wrap. This needs visual confirmation.

---

## UI07 — Existing booking data remains unchanged after availability checks

| Field | Value |
|---|---|
| **Steps** | 1. Open the app in Bolt's preview. 2. Select room **A101 — Lecture Hall A**. 3. Note the existing bookings shown on the room card: "09:00–10:30", "12:00–13:00", "15:00–17:00". 4. Set Start to **12:30**, End to **13:30** (overlapping). 5. Click "Check Availability" — observe "Unavailable" with overlap reason. 6. Verify the room card still shows the same three booking chips: "09:00–10:30", "12:00–13:00", "15:00–17:00". 7. Change Start to **13:30**, End to **14:00** (valid). 8. Click "Check Availability" — observe "Available". 9. Verify the room card still shows the same three booking chips unchanged. |
| **Input values** | Room: A101. Two checks: overlapping (12:30–13:30), then valid (13:30–14:00). |
| **Expected visible result** | The booking chips on the room card and the timeline bars remain identical before and after each check. No bookings are added, removed, or altered. |
| **Actual observed result** | Not verified |
| **Status** | Not verified |

**Rationale:** `checkAvailability` is a pure function that reads bookings but never mutates them (verified by automated tests T14 and T21). The UI stores rooms in a static import (`src/lib/data.ts`) with no mutation path. This UI check confirms the visible behavior matches: the room card and timeline should not change.

---

## Summary

| ID | Scenario | Status |
|---|---|---|
| UI01 | Valid future booking → Available | Not verified |
| UI02 | Overlapping booking → Unavailable with feedback | Not verified |
| UI03 | Blocked room → Unavailable | Not verified |
| UI04 | Invalid/malformed times → validation feedback | Not verified |
| UI05 | Booking > 120 min → rejected | Not verified |
| UI06 | Result area readable at mobile width | Not verified |
| UI07 | Booking data unchanged after checks | Not verified |

## Remaining gaps and evidence needed for submission

1. **All 7 UI scenarios are unverified.** Browser interaction is required to confirm the visible behavior matches the expected results. A human should open Bolt's preview and execute each scenario's steps, then record the actual observed result and update the status to Pass or Fail.

2. **UI04 has a caveat:** The HTML `<input type="time">` element may prevent entry of values outside 00:00–23:59 at the browser level. The alternate step (empty field) ensures the validation path is exercised, but the tester should try both and record which approach worked.

3. **UI05 has an overlap confound:** The initial steps (A101, 13:00–15:30) may produce two reasons (duration + overlap). The cleaner alternative (B204, 09:30–12:00) isolates the duration check. The tester should use the cleaner alternative if they want to verify AC2 in isolation.

4. **No screenshots or recordings have been captured.** For submission evidence, screenshots of each scenario's result (both Available and Unavailable states, plus the mobile viewport check) should be attached.

5. **Automated test evidence is complete:** 21/21 tests pass, 3/3 mutations detected, typecheck clean, build clean. See `PRACTICE07_MUTATION_LOG.md` for mutation trial details.
