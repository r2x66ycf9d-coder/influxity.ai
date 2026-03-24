import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingText?: string;
  onRetry?: () => void;
}

/**
 * Unified loading and error state component
 * Handles loading spinners, error messages, and retry functionality
 */
export function LoadingState({ 
  isLoading, 
  error, 
  children, 
  loadingText = 'Loading...', 
  onRetry 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
        <span className="text-gray-600 font-medium">{loadingText}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-gray-800 font-medium mb-2">Something went wrong</p>
        <p className="text-gray-500 text-sm mb-4">{error.message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
