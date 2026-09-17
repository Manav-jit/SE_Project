import { Suspense } from 'react';
import WizardClient from './WizardClient';

export default function WizardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading wizard...</div>
      </main>
    }>
      <WizardClient />
    </Suspense>
  );
}
