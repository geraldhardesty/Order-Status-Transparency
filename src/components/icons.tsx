type IconProps = { size?: number; className?: string };

export function SearchIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ size = 12, className, direction = 'right' }: IconProps & { direction?: 'right' | 'down' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      style={{ transform: direction === 'down' ? 'rotate(90deg)' : undefined, transition: 'transform 0.12s ease' }}
      aria-hidden="true"
    >
      <path d="M4 2L8.5 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className} aria-hidden="true">
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12.5V13.5H13V12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function RefreshIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path
        d="M13 8A5 5 0 1 1 11.2 4.2M13 2v3.5h-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownloadIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 3V11M8 11L5 8M8 11L11 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12.5V13.5H13V12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BoltIcon({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" fill="currentColor" />
    </svg>
  );
}
