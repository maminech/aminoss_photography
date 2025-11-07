import GoogleCalendarIntegration from '@/modules/admin/GoogleCalendarIntegration';

export const metadata = {
  title: 'Calendar Integration - Admin Dashboard',
  description: 'Manage Google Calendar integration',
};

export default function CalendarIntegrationPage() {
  return <GoogleCalendarIntegration />;
}
