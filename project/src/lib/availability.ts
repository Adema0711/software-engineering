import type { Room } from './types';
import { DAY_LENGTH, minutesToHHMM } from './time';

export interface CheckResult {
  available: boolean;
  reasons: string[];
}

function intervalsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  // touching endpoints are allowed, so strict inequality
  return startA < endB && startB < endA;
}

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number,
): CheckResult {
  const reasons: string[] = [];

  // AC1: validate interval bounds
  if (!(0 <= start && start < end && end <= DAY_LENGTH)) {
    reasons.push('End time must be after start time, and both times must be within the same day.');
  } else if (start <= currentTime) {
    reasons.push(`Start time must be after the current time (${minutesToHHMM(currentTime)}).`);
  }

  // AC2: reject bookings longer than 120 minutes
  if (end - start > 120) {
    reasons.push('Booking duration cannot exceed 120 minutes.');
  }

  // AC3: reject when room is blocked
  if (room.blocked) {
    reasons.push('This room is currently blocked and unavailable for booking.');
  }

  // AC4: reject overlapping intervals (touching endpoints allowed)
  if (reasons.length === 0) {
    for (const b of room.bookings) {
      if (intervalsOverlap(start, end, b.start, b.end)) {
        reasons.push(
          `Overlaps existing booking "${b.title}" (${minutesToHHMM(b.start)}–${minutesToHHMM(b.end)}).`,
        );
        break;
      }
    }
  }

  return { available: reasons.length === 0, reasons };
}
