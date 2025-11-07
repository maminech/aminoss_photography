import ClientRequestsTab from '@/modules/admin/ClientRequestsTab';

export const metadata = {
  title: 'Client Requests - Admin Dashboard',
  description: 'Manage client booking requests and quotes',
};

export default function ClientRequestsPage() {
  return <ClientRequestsTab />;
}
