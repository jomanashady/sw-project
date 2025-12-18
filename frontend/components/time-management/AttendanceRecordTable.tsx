"use client";

import { useMemo } from "react";

interface AttendanceRecord {
  _id?: string;
  id?: string;
  date: string | Date;
  clockIn?: string | Date;
  clockOut?: string | Date;
  clockInTime?: string | Date;
  clockOutTime?: string | Date;
  totalWorkMinutes?: number;
  duration?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'INCOMPLETE' | 'COMPLETE' | 'CORRECTION_PENDING';
}

interface AttendanceRecordTableProps {
  records: AttendanceRecord[];
  showViewAllLink?: boolean;
}

export function AttendanceRecordTable({
  records = [],
  showViewAllLink = false,
}: AttendanceRecordTableProps) {
  const formatTime = (time?: string | Date) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'PRESENT': 'bg-green-100 text-green-800',
      'COMPLETE': 'bg-green-100 text-green-800',
      'ABSENT': 'bg-red-100 text-red-800',
      'LATE': 'bg-yellow-100 text-yellow-800',
      'INCOMPLETE': 'bg-gray-100 text-gray-800',
      'CORRECTION_PENDING': 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || colors['ABSENT'];
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No attendance records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Clock In</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Clock Out</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {records.map(record => {
            const recordId = record._id || record.id || Math.random().toString();
            // Support both backend field names (clockIn/clockOut) and legacy names (clockInTime/clockOutTime)
            const clockInTime = record.clockIn || record.clockInTime;
            const clockOutTime = record.clockOut || record.clockOutTime;
            const workDuration = record.totalWorkMinutes || record.duration;
            
            return (
              <tr key={recordId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatTime(clockInTime)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatTime(clockOutTime)}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatDuration(workDuration)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      record.status,
                    )}`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
