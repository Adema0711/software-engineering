import { useMemo } from 'react';
import type { Room } from '@/lib/types';
import { minutesToHHMM, DAY_LENGTH } from '@/lib/time';

interface Props {
  room: Room;
  candidateStart: number | null;
  candidateEnd: number | null;
}

export function Timeline({ room, candidateStart, candidateEnd }: Props) {
  const hours = useMemo(
    () => Array.from({ length: 25 }, (_, i) => (i * 60)),
    [],
  );

  const pct = (min: number) => `${(min / DAY_LENGTH) * 100}%`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Today's Schedule — {room.name}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-400" /> Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-400" /> Your slot
          </span>
          {room.blocked && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" /> Blocked
            </span>
          )}
        </div>
      </div>

      <div className="relative h-16 overflow-hidden rounded-lg bg-slate-50">
        {/* hour grid lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: pct(h) }}
          />
        ))}

        {/* existing bookings */}
        {room.bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-1 bottom-1 rounded-sm bg-slate-400 px-1 flex items-center overflow-hidden"
            style={{ left: pct(b.start), width: `${((b.end - b.start) / DAY_LENGTH) * 100}%` }}
            title={`${b.title} (${minutesToHHMM(b.start)}–${minutesToHHMM(b.end)})`}
          >
            <span className="truncate text-[10px] font-medium text-white">{b.title}</span>
          </div>
        ))}

        {/* blocked overlay */}
        {room.blocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-400/20">
            <span className="text-xs font-semibold text-red-700">Room Blocked</span>
          </div>
        )}

        {/* candidate interval */}
        {candidateStart !== null && candidateEnd !== null && candidateStart < candidateEnd && (
          <div
            className="absolute top-1 bottom-1 rounded-sm border-2 border-sky-500 bg-sky-400/40"
            style={{ left: pct(candidateStart), width: `${((candidateEnd - candidateStart) / DAY_LENGTH) * 100}%` }}
          />
        )}
      </div>

      {/* hour labels */}
      <div className="relative mt-1 h-5 text-[10px] text-slate-400">
        {hours.filter((h) => h % 180 === 0).map((h) => (
          <span
            key={h}
            className="absolute -translate-x-1/2"
            style={{ left: pct(h) }}
          >
            {minutesToHHMM(h)}
          </span>
        ))}
      </div>
    </div>
  );
}
