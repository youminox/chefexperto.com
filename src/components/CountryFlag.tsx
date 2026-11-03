interface CountryFlagProps {
  slug: string;
  className?: string;
}

export default function CountryFlag({ slug, className = 'w-5 h-3.5' }: CountryFlagProps) {
  const baseClass = `inline-block rounded-[2px] shadow-xs shrink-0 align-middle ${className}`;

  switch (slug) {
    case 'espana':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="24" height="16" fill="#AA151B" />
          <rect y="4" width="24" height="8" fill="#F1BF00" />
        </svg>
      );
    case 'mexico':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="8" height="16" fill="#006847" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#CE1126" />
          <circle cx="12" cy="8" r="2" fill="#8C6239" />
        </svg>
      );
    case 'colombia':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="24" height="8" fill="#FCD116" />
          <rect y="8" width="24" height="4" fill="#003893" />
          <rect y="12" width="24" height="4" fill="#CE1126" />
        </svg>
      );
    case 'usa':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="24" height="16" fill="#B22234" />
          <path
            d="M0 2.46h24M0 4.92h24M0 7.38h24M0 9.85h24M0 12.31h24M0 14.77h24"
            stroke="#FFFFFF"
            strokeWidth="1.23"
          />
          <rect width="10" height="8.6" fill="#3C3B6E" />
        </svg>
      );
    case 'guatemala':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="8" height="16" fill="#4997D0" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#4997D0" />
          <circle cx="12" cy="8" r="2" fill="#509E2F" />
        </svg>
      );
    case 'chile':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#D52B1E" />
          <rect width="8" height="8" fill="#0039A6" />
          <polygon
            points="4,1.8 4.6,3.5 6.4,3.5 4.9,4.5 5.5,6.2 4,5.2 2.5,6.2 3.1,4.5 1.6,3.5 3.4,3.5"
            fill="#FFFFFF"
          />
        </svg>
      );
    case 'puerto-rico':
      return (
        <svg viewBox="0 0 24 16" className={baseClass} aria-hidden="true">
          <rect width="24" height="16" fill="#ED0000" />
          <rect y="3.2" width="24" height="3.2" fill="#FFFFFF" />
          <rect y="9.6" width="24" height="3.2" fill="#FFFFFF" />
          <polygon points="0,0 11,8 0,16" fill="#0050F0" />
          <polygon
            points="3.8,5.8 4.3,7.3 5.9,7.3 4.6,8.2 5.1,9.7 3.8,8.8 2.5,9.7 3.0,8.2 1.7,7.3 3.3,7.3"
            fill="#FFFFFF"
          />
        </svg>
      );
    default:
      return null;
  }
}
