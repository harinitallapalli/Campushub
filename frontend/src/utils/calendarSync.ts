/**
 * Utility to generate and download standard iCalendar (.ics) files
 * Compatible with Google Calendar, Microsoft Outlook, and Apple Calendar.
 */

export interface CalendarEventItem {
  id: string | number;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD or ISO string
  endDate?: string;
  location?: string;
}

function formatDateToICS(dateStr: string): string {
  const clean = dateStr.replace(/[-:]/g, '').split('T')[0];
  return `${clean}T090000Z`;
}

export function exportToICS(events: CalendarEventItem[], filename = 'campushub_schedule.ics') {
  if (events.length === 0) {
    alert('No items available to export.');
    return;
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusHub//Student Academic Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(item => {
    const start = formatDateToICS(item.startDate);
    const end = item.endDate ? formatDateToICS(item.endDate) : start;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${item.id}-campushub@university.edu`);
    lines.push(`DTSTAMP:${formatDateToICS(new Date().toISOString().split('T')[0])}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${item.title.replace(/[,;]/g, ' ')}`);
    if (item.description) {
      lines.push(`DESCRIPTION:${item.description.replace(/\n/g, '\\n')}`);
    }
    if (item.location) {
      lines.push(`LOCATION:${item.location}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
