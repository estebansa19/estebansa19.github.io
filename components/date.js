import { parseISO, format } from 'date-fns';

export default function Date({ dateString }) {
  if (dateString === 'present') return 'Present';
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, 'LLLL, d, yyyy')}</time>;
}
