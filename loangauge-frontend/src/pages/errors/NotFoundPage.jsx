import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white font-sans text-text-primary">
      <Card className="max-w-md w-full p-8 text-center bg-white border border-border rounded space-y-4">
        <div className="w-12 h-12 rounded bg-surface-hover border border-border flex items-center justify-center text-text-primary mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        
        <div className="space-y-1">
          <span className="text-3xl font-extrabold text-text-primary">404</span>
          <h1 className="text-xl font-bold text-text-primary">Page Not Found</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The page or financial calibration resource you requested does not exist or has been relocated.
          </p>
        </div>

        <Link to="/" className="block">
          <Button variant="primary" fullWidth rightIcon={Home}>
            Back to Home Page
          </Button>
        </Link>
      </Card>
    </div>
  );
}

