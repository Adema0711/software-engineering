export interface Booking {
  id: string;
  start: number; // minutes from midnight (0–1440)
  end: number;
  title: string;
  bookedBy: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  bookings: Booking[];
}
