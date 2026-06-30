interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'full' | 'icon';
}

const sizes = {
  sm: { icon: 'w-8 h-8', text: 'text-lg', container: 'w-8 h-8' },
  md: { icon: 'w-10 h-10', text: 'text-xl', container: 'w-10 h-10' },
  lg: { icon: 'w-14 h-14', text: 'text-2xl', container: 'w-14 h-14' },
  xl: { icon: 'w-20 h-20', text: 'text-3xl', container: 'w-20 h-20' },
};

export function Logo({ size = 'md', showText = true, variant = 'full' }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${variant === 'icon' ? '' : ''}`}>
      {/* Logo Icon */}
      <div className={`${s.container} relative flex items-center justify-center`}>
        {/* Outer glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl blur-sm opacity-60" />
        
        {/* Main container */}
        <div className={`relative ${s.container} bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}>
          {/* Hexagon / Network logo */}
          <svg 
            className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} text-white`} 
            viewBox="0 0 24 24" 
            fill="none"
          >
            {/* Hexagon shape */}
            <path
              d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.1)"
            />
            {/* Inner connection lines */}
            <path
              d="M12 2V8M12 16V22M3 7L9 11M15 13L21 17M21 7L15 11M9 13L3 17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center node */}
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            {/* Corner nodes */}
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
            <circle cx="6" cy="8.5" r="1.5" fill="currentColor" />
            <circle cx="18" cy="8.5" r="1.5" fill="currentColor" />
            <circle cx="6" cy="15.5" r="1.5" fill="currentColor" />
            <circle cx="18" cy="15.5" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Text */}
      {showText && variant === 'full' && (
        <div className="flex flex-col">
          <span className={`font-bold text-white ${s.text} tracking-tight leading-none`}>
            Nexus<span className="text-cyan-400">Hub</span>
          </span>
          {size !== 'sm' && (
            <span className="text-gray-500 text-xs tracking-wider">PLATFORM</span>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(6,182,212,0.1)"
      />
      <path
        d="M12 2V8M12 16V22M3 7L9 11M15 13L21 17M21 7L15 11M9 13L3 17"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="url(#logoGradient)" />
    </svg>
  );
}
