# AGENTS.md

## Project

Smart Campus room availability checker. Users select a room and a time range,
then the app reports whether the slot is available based on a fixed set of
booking rules. The project uses fictional fixture data and a fixed simulated
current time. No backend, database, login, or booking creation exists.

Preserve the existing project behavior and UI.

### Project structure

| Concern | Location | Notes |
|---------|----------|-------|
| Availability rules | `src/lib/availability.ts` | `checkAvailability(room, start, end, currentTime)` implements AC1–AC5. Returns `{ available, reasons }`. |
| Time helpers | `src/lib/availability.ts` (current) | `minutesToHHMM` and `hhmmToMinutes`. **Planned:** move verbatim into `src/lib/time.ts`. |
| Day-length constant | `src/lib/availability.ts` (literal `1440`), `src/components/Timeline.tsx` (`DAY_LENGTH`) | **Planned:** centralize as `DAY_LENGTH` in `src/lib/time.ts`. |
| Booking-policy constant | `src/lib/availability.ts` | `120`-minute max duration. Stays here — it is a booking-policy constraint, not a time utility. |
| Types | `src/lib/types.ts` | `Booking` and `Room` interfaces. |
| Fixture data | `src/lib/data.ts` | Four rooms (A101, B204, C310, D105) with eight bookings total. |
| Tests | `src/lib/availability.test.ts` | 23 tests (T01–T23) covering AC1–AC5 boundaries and BUG-A/BUG-B regressions. |
| UI entry | `src/App.tsx` | Room selection, time inputs, check button, result banner, timeline. `CURRENT_TIME_MIN = 600`. |
| UI components | `src/components/RoomSelector.tsx`, `src/components/TimeInputs.tsx`, `src/components/Timeline.tsx`, `src/components/ResultBanner.tsx` | Responsive desktop/mobile layout with Tailwind CSS. |
| Backup files | `src/lib/availability.ts.baseline`, `src/lib/availability.ts.clean` | Practice #07/#08 artifacts. Leave unchanged. |

## Acceptance criteria

- **AC1:** Reject start >= end and requests starting before the fixed current time.
- **AC2:** Reject durations greater than 120 minutes.
- **AC3:** Reject a blocked room.
- **AC4:** Reject overlapping intervals; allow intervals that only touch at endpoints.
- **AC5:** Do not mutate rooms, bookings, or fixture data.
- **AC6:** Preserve clear feedback and the existing responsive desktop/mobile UI.

## Engineering rules

- Make minimal changes and prefer pure functions.
- Use at most two patterns, only when justified by a real problem.
- Approved refactoring: move the existing time conversion helpers verbatim into `src/lib/time.ts` and share `DAY_LENGTH` between `availability.ts` and `Timeline.tsx`.
- Keep the 120-minute booking-policy constraint in `availability.ts`.
- Preserve `checkAvailability` inputs, outputs, validation order, and messages.
- Do not add features, dependencies, backend, database, login, or booking creation.
- Leave backup files unchanged.
- Preserve the existing four-room fixture dataset.

## Verification

Exact commands available in `package.json` scripts:

| Command | Script | Purpose |
|---------|--------|---------|
| `npm test` | `vitest run` | Run the full Vitest test suite once. |
| `npm run test:watch` | `vitest` | Run tests in watch mode. |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.app.json` | Type-check without emitting output. |
| `npm run build` | `vite build` | Production build. |
| `npm run lint` | `eslint .` | Lint the project. |
| `npx vitest run -t "T23"` | (direct vitest) | Run a single targeted test by name. |

Do not invent commands or claim checks were run unless they were actually executed.

Preserve existing assertions and add focused regression coverage where missing.

Report changed files, rationale, exact commands, and actual results.
