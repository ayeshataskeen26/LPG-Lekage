import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
  fallbackSubtitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
  fallbackSubtitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-600 p-6 text-center border border-slate-200 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ShieldAlert className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-800">{fallbackTitle}</p>
        {fallbackSubtitle ? (
          <p className="text-xs text-slate-500 mt-1 max-w-xs">{fallbackSubtitle}</p>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
