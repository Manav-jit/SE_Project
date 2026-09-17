import { loadSchemes } from '@/lib/schemes/loader';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const schemes = await loadSchemes();
  return <DashboardClient schemes={schemes} />;
}
