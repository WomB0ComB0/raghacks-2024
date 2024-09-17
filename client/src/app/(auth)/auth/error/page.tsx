import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import React from 'react';

export const runtime = 'edge';

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-primary/20 to-background">
      <div className="w-full max-w-md overflow-hidden rounded-lg shadow-lg bg-card text-card-foreground">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20">
            <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-center">Authentication Error</h1>
          <p className="mb-6 text-center text-muted-foreground">
            We're sorry, but there was an issue authenticating your account. This could be due to an
            expired session or invalid credentials.
          </p>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button className="w-full" onClick={() => (window.location.href = '/signin')}>
              Try Again
            </Button>
          </div>
        </div>
        <div className="px-6 py-4 text-sm text-center bg-muted text-muted-foreground">
          <p>If the problem persists, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}
