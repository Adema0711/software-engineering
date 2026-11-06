import { useState } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import { rooms } from '@/lib/data';
import { checkAvailability } from '@/lib/availability';
import { hhmmToMinutes, minutesToHHMM } from '@/lib/time';
import type { CheckResult } from '@/lib/availability';
import { RoomSelector } from '@/components/RoomSelector';
import { TimeInputs } from '@/components/TimeInputs';
import { Timeline } from '@/components/Timeline';
import { ResultBanner } from '@/components/ResultBanner';

// Simulated "current campus time" — fixed at 10:00 for the prototype
const CURRENT_TIME_MIN = 600;

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [result, setResult] = useState<CheckResult | null>(null);

  const room = rooms.find((r) => r.id === selectedRoomId)!;
  const startMin = hhmmToMinutes(startTime);
  const endMin = hhmmToMinutes(endTime);

  const handleCheck = () => {
    if (startMin === null || endMin === null) {
      setResult({ available: false, reasons: ['Please enter valid times in HH:MM format.'] });
      return;
    }
    setResult(checkAvailability(room, startMin, endMin, CURRENT_TIME_MIN));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Smart Campus Room Checker</h1>
              <p className="text-sm text-slate-500">Check room availability before you book</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
        {/* Step 1: Room selection */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            1. Choose a room
          </h2>
          <RoomSelector rooms={rooms} selectedId={selectedRoomId} onSelect={setSelectedRoomId} />
        </section>

        {/* Step 2: Time inputs */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            2. Pick a time
          </h2>
          <TimeInputs
            startTime={startTime}
            endTime={endTime}
            currentTimeLabel={minutesToHHMM(CURRENT_TIME_MIN)}
            onChangeStart={setStartTime}
            onChangeEnd={setEndTime}
          />
        </section>

        {/* Check button */}
        <button
          onClick={handleCheck}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-sky-700 active:bg-sky-800"
        >
          <Search className="h-5 w-5" />
          Check Availability
        </button>

        {/* Result */}
        <ResultBanner
          available={result?.available ?? false}
          reasons={result?.reasons ?? []}
          hasChecked={result !== null}
        />

        {/* Timeline */}
        <Timeline
          room={room}
          candidateStart={startMin}
          candidateEnd={endMin}
        />

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400">
          Prototype only — bookings are not saved. Uses fictional campus data.
        </p>
      </main>
    </div>
  );
}

export default App;
