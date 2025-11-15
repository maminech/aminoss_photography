import { Metadata } from 'next';
import HighlightsManager from '@/components/admin/HighlightsManager';

export const metadata: Metadata = {
  title: 'Highlights Manager | Admin Dashboard',
  description: 'Manage Instagram-style story highlights',
};

export default function HighlightsPage() {
  return <HighlightsManager />;
}
