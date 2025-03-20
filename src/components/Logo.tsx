
import { Car } from "lucide-react";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Logo = ({ size = 'md', color = 'text-white' }: LogoProps) => {
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size];

  return (
    <div className={`flex items-center gap-2 flota-logo ${color}`}>
      <Car className="h-6 w-6" />
      <span className={sizeClass}>Fleet Track</span>
    </div>
  );
};

export default Logo;
