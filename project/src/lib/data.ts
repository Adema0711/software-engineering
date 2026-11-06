import type { Room } from './types';

export const rooms: Room[] = [
  {
    id: 'A101',
    name: 'Lecture Hall A',
    building: 'Engineering Block',
    capacity: 120,
    blocked: false,
    bookings: [
      { id: 'b1', start: 540, end: 630, title: 'Data Structures 101', bookedBy: 'Prof. Lin' },
      { id: 'b2', start: 720, end: 780, title: 'Faculty Meeting', bookedBy: 'Dept. Office' },
      { id: 'b3', start: 900, end: 1020, title: 'Robotics Workshop', bookedBy: 'Prof. Okafor' },
    ],
  },
  {
    id: 'B204',
    name: 'Lab B-204',
    building: 'Science Wing',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b4', start: 480, end: 540, title: 'Chemistry Lab', bookedBy: 'Prof. Garcia' },
      { id: 'b5', start: 780, end: 900, title: 'Physics Practical', bookedBy: 'Prof. Ahmed' },
    ],
  },
  {
    id: 'C310',
    name: 'Seminar Room C-310',
    building: 'Humanities Center',
    capacity: 20,
    blocked: true,
    bookings: [
      { id: 'b6', start: 600, end: 660, title: 'Maintenance Slot', bookedBy: 'Facilities' },
    ],
  },
  {
    id: 'D105',
    name: 'Study Lounge D-105',
    building: 'Library',
    capacity: 8,
    blocked: false,
    bookings: [
      { id: 'b7', start: 600, end: 720, title: 'Group Project', bookedBy: 'Student Team' },
      { id: 'b8', start: 840, end: 960, title: 'Book Club', bookedBy: 'Library Staff' },
    ],
  },
];
