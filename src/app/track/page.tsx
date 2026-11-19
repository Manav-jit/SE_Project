import { Suspense } from 'react';
import TrackClient from './TrackClient';
import { Loader2 } from 'lucide-react';

export default function TrackPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-black font-serif">Loading Citizen Tracking Portal...</p>
          </div>
        </div>
      }
    >
      <TrackClient />
    </Suspense>
  );
}
