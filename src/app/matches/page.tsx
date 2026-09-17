import { Suspense } from 'react';
import MatchesClient from './MatchesClient';

export default function MatchesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading results...</div>
      </main>
    }>
      <MatchesClient />
    </Suspense>
  );
}
