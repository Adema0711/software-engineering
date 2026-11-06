import { Building2, Users, Ban } from 'lucide-react';
import type { Room } from '@/lib/types';
import { minutesToHHMM } from '@/lib/time';

interface Props {
  rooms: Room[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function RoomSelector({ rooms, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rooms.map((room) => {
        const active = room.id === selectedId;
        return (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            className={[
              'rounded-xl border p-4 text-left transition-all duration-200',
              active
                ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{room.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {room.building}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {room.capacity}
                  </span>
                </div>
              </div>
              {room.blocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  <Ban className="h-3 w-3" /> Blocked
                </span>
              )}
            </div>
            {room.bookings.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {room.bookings.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {minutesToHHMM(b.start)}–{minutesToHHMM(b.end)}
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
