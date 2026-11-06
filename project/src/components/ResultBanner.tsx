import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  available: boolean;
  reasons: string[];
  hasChecked: boolean;
}

export function ResultBanner({ available, reasons, hasChecked }: Props) {
  if (!hasChecked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span className="text-sm">Select a room and time range, then click "Check Availability".</span>
      </div>
    );
  }

  if (available) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-emerald-800">Available</p>
          <p className="text-sm text-emerald-700">
            This time slot is free. You can proceed to book it through the campus portal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-3">
        <XCircle className="h-6 w-6 shrink-0 text-red-600" />
        <p className="font-semibold text-red-800">Unavailable</p>
      </div>
      <ul className="mt-2 space-y-1 pl-9">
        {reasons.map((r, i) => (
          <li key={i} className="text-sm text-red-700">• {r}</li>
        ))}
      </ul>
    </div>
  );
}
