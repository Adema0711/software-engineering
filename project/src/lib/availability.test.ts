import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import type { Room, Booking } from './types';

/**
 * Practice #07 — Test suite for checkAvailability
 *
 * Default fixture (per assignment):
 *   currentTime = 540 (09:00)
 *   room.blocked = false
 *   room.bookings = [{ id: 'x1', start: 600, end: 660, title: 'Existing', bookedBy: 'Tester' }]
 *
 * NOTE: The UI in App.tsx uses CURRENT_TIME_MIN = 600 (10:00).
 *   Tests use currentTime = 540 as specified by the assignment default.
 *   The helper accepts currentTime as a parameter, so tests are independent.
 */

const DEFAULT_CURRENT_TIME = 540;
const DEFAULT_BOOKING: Booking = {
  id: 'x1',
  start: 600,
  end: 660,
  title: 'Existing',
  bookedBy: 'Tester',
};

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'TEST',
    name: 'Test Room',
    building: 'Test Building',
    capacity: 10,
    blocked: false,
    bookings: [structuredClone(DEFAULT_BOOKING)],
    ...overrides,
  };
}

function makeDefaultRoom(): Room {
  return makeRoom();
}

describe('checkAvailability', () => {
  // T01 — Valid future booking, no overlap, not touching any boundary → available
  it('T01: valid future booking with no overlap is available', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 700, 750, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T02 — Start time equal to current time → unavailable
  it('T02: start equal to current time is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 540, 600, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('Start time must be after the current time');
  });

  // T03 — Start time before current time → unavailable
  it('T03: start before current time is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 480, 540, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('Start time must be after the current time');
  });

  // T04 — Start time equal to end time → unavailable
  it('T04: start equal to end is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 660, 660, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('End time must be after start time');
  });

  // T05 — Start time greater than end time → unavailable
  it('T05: start greater than end is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 720, 660, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('End time must be after start time');
  });

  // T06 — Start below 0 → unavailable
  it('T06: start below 0 is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, -30, 60, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('End time must be after start time');
  });

  // T07 — End greater than 1440 → unavailable
  it('T07: end greater than 1440 is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 1380, 1500, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('End time must be after start time');
  });

  // T08 — Duration exactly 120 minutes → allowed
  it('T08: duration exactly 120 minutes is allowed', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 660, 780, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T09 — Duration 121 minutes → unavailable
  it('T09: duration 121 minutes is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 660, 781, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('Booking duration cannot exceed 120 minutes');
  });

  // T10 — Blocked room → unavailable
  it('T10: blocked room is unavailable with specific blocked-room message', () => {
    const room = makeRoom({ blocked: true });
    const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toBe('This room is currently blocked and unavailable for booking.');
  });

  // T11 — Overlapping existing booking → unavailable
  it('T11: overlapping existing booking is unavailable', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 630, 690, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('Overlaps existing booking');
  });

  // T12 — Start equals currentTime; AC1b rejects before overlap check can run
  it('T12: start equals current time is unavailable via AC1b before overlap check', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 540, 600, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('Start time must be after the current time');
  });

  // T13 — Proposed booking starts exactly when existing ends → allowed
  it('T13: start touches existing end is allowed', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T14 — Existing booking data remains unchanged after checking
  it('T14: existing booking data is unchanged after checking availability', () => {
    const room = makeDefaultRoom();
    const originalBookings = structuredClone(room.bookings);

    checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);

    expect(room.bookings).toEqual(originalBookings);
    expect(room.bookings).toHaveLength(1);
    expect(room.bookings[0].start).toBe(600);
    expect(room.bookings[0].end).toBe(660);
    expect(room.bookings[0].title).toBe('Existing');
    expect(room.bookings[0].bookedBy).toBe('Tester');
    expect(room.bookings[0].id).toBe('x1');
  });

  // T15 — End touches existing start with valid future start → allowed
  it('T15: end touches existing start with valid future start is allowed', () => {
    const room = makeDefaultRoom();
    const result = checkAvailability(room, 541, 600, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T16 — Multiple overlapping bookings: first overlap reported, loop breaks
  it('T16: first overlap is reported and loop breaks on multiple overlapping bookings', () => {
    const room = makeRoom({
      bookings: [
        { id: 'b1', start: 600, end: 660, title: 'First', bookedBy: 'A' },
        { id: 'b2', start: 650, end: 750, title: 'Second', bookedBy: 'B' },
      ],
    });
    const result = checkAvailability(room, 580, 700, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('First');
    expect(result.reasons[0]).not.toContain('Second');
  });

  // T17 — AC1 and AC2 both fail: multiple reasons returned (independent checks)
  it('T17: invalid bounds and excessive duration produce both reasons', () => {
    const room = makeDefaultRoom();
    // start = -30 (fails AC1: start < 0)
    // end = 200 → duration = 200 - (-30) = 230 (fails AC2: > 120)
    const result = checkAvailability(room, -30, 200, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(2);
    expect(result.reasons[0]).toContain('End time must be after start time');
    expect(result.reasons[1]).toContain('Booking duration cannot exceed 120 minutes');
  });

  // T18 — Lower boundary: start = 0 is valid (AC1 allows 0 <= start)
  it('T18: start at 0 (lower boundary) is valid when currentTime is before midnight', () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 0, 60, -1);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T19 — Upper boundary: end = 1440 is valid (AC1 allows end <= 1440)
  it('T19: end at 1440 (upper boundary) is valid with start after currentTime', () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 1380, 1440, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T20 — Empty bookings array: valid booking is available (AC4 trivially passes)
  it('T20: room with no existing bookings accepts a valid future booking', () => {
    const room = makeRoom({ bookings: [] });
    const result = checkAvailability(room, 700, 750, DEFAULT_CURRENT_TIME);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T21 — Data preservation on a rejected booking (overlap path)
  it('T21: existing booking data is unchanged after an overlap rejection', () => {
    const room = makeDefaultRoom();
    const originalBookings = structuredClone(room.bookings);

    const result = checkAvailability(room, 630, 690, DEFAULT_CURRENT_TIME);

    expect(result.available).toBe(false);
    expect(room.bookings).toEqual(originalBookings);
    expect(room.bookings).toHaveLength(1);
    expect(room.bookings[0].start).toBe(600);
    expect(room.bookings[0].end).toBe(660);
    expect(room.bookings[0].title).toBe('Existing');
    expect(room.bookings[0].bookedBy).toBe('Tester');
    expect(room.bookings[0].id).toBe('x1');
  });

  // T22 — Regression test for BUG-A: touching endpoints must be allowed
  // Existing booking: 12:00–13:00 (720–780)
  // Requested booking: 13:00–14:00 (780–840)
  // Expected: available (touching endpoints are not overlaps)
  it('T22: start touches existing end is available (BUG-A regression)', () => {
    const room = makeRoom({
      bookings: [
        { id: 'reg1', start: 720, end: 780, title: 'Noon Meeting', bookedBy: 'Tester' },
      ],
    });
    const result = checkAvailability(room, 780, 840, 600);
    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  // T23 — Regression test for BUG-B: checkAvailability must not mutate room.bookings
  it('T23: existing bookings are unchanged after an availability check (BUG-B regression)', () => {
    const room = makeRoom({
      bookings: [
        { id: 'r1', start: 600, end: 660, title: 'Morning Class', bookedBy: 'Prof. Tan' },
        { id: 'r2', start: 720, end: 780, title: 'Afternoon Lab', bookedBy: 'Prof. Lee' },
      ],
    });
    const originalBookings = structuredClone(room.bookings);
    const bookingsRef = room.bookings;

    const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);

    expect(result.available).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(room.bookings).toBe(bookingsRef);
    expect(room.bookings).toEqual(originalBookings);
    expect(room.bookings).toHaveLength(2);
  });
});
