import { Car } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  variant?: 'default' | 'dark'
}

const Logo = ({
  size = 'md',
  color = 'text-white',
  variant = 'default'
}: LogoProps) => {
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size]

  const iconSize = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 }
  }[size]

  const getIconPath = () => {
    if (variant === 'dark') {
      return size === 'lg' ? '/favicon-96x96.png' : '/favicon-32x32.png'
    } else {
      return {
        sm: '/ms-icon-70x70.png',
        md: '/ms-icon-144x144.png',
        lg: '/ms-icon-150x150.png'
      }[size]
    }
  }

  return (
    <div
      className={`flex items-center gap-3 flota-logo ${color} transition-all duration-200`}
    >
      <img
        src={getIconPath()}
        alt="Fleet Track Logo"
        width={iconSize.width}
        height={iconSize.height}
        className="object-contain drop-shadow-sm transition-transform hover:scale-105"
      />
      <span className={`font-semibold tracking-tight ${sizeClass}`}>
        Fleet Track
      </span>
    </div>
  )
}

export default Logo
