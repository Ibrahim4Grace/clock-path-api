import { ClockIn } from '../models/index.js';
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generateAttendanceSummary = async (users) => {
  return await Promise.all(
    users.map(async (user) => {
      const { full_name, role, work_days, shift_duration } = user;

      // Fetch user's clock-in records
      const attendanceRecords = await ClockIn.find({ user: user._id });

      // Calculate days present, missed shifts, and late entries
      const daysPresent = attendanceRecords.length;
      const missedShifts = attendanceRecords.filter(
        (record) => record.missedShift
      ).length;

      const lateEntries = attendanceRecords.filter((record) => {
        // Check if clock-in time is after the expected shift start
        const shiftStart = new Date(record.clockInTime);
        const [startHour, startMinute] = shift_duration.start.split(':');
        shiftStart.setHours(startHour, startMinute, 0);

        return record.clockInTime > shiftStart;
      }).length;

      // Calculate attendance percentage based on 5 workdays
      const totalWorkingDays = 5;
      const attendancePercentage = (
        (daysPresent / totalWorkingDays) *
        100
      ).toFixed(2);

      return {
        user: full_name,
        role,
        daysPresent,
        missedShifts,
        lateEntries,
        attendancePercentage: `${attendancePercentage}%`,
      };
    })
  );
};

export const createDocDefinition = (summaryData) => {
  return {
    content: [
      { text: 'Attendance Summary', style: 'header' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              'User',
              'Role',
              'Days Present',
              'Missed Shifts',
              'Late Entries',
              'Attendance Percentage',
            ], // Header row
            ...summaryData.map((summary) => [
              summary.user || 'N/A',
              summary.role || 'N/A',
              summary.daysPresent || 0,
              summary.missedShifts || 0,
              summary.lateEntries || 0,
              summary.attendancePercentage || '0.00%',
            ]),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 10],
        alignment: 'center',
      },
      tableExample: {
        margin: [0, 5, 0, 15],
      },
    },
  };
};
