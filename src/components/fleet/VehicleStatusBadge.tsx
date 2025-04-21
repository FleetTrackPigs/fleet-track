import { Badge, BadgeProps } from '@/components/ui/badge';
import { VehicleStatus } from '@/types/fleet';
import { CheckCircle2, User, Wrench } from 'lucide-react';

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  size?: 'sm' | 'default';
}

export function VehicleStatusBadge({ status, size = 'default' }: VehicleStatusBadgeProps) {
  const getBadgeVariant = (): BadgeProps['variant'] => {
    switch (status) {
      case 'available':
        return 'outline';
      case 'assigned':
        return 'default';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getIconAndLabel = () => {
    switch (status) {
      case 'available':
        return {
          icon: <CheckCircle2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
          label: 'Disponible'
        };
      case 'assigned':
        return {
          icon: <User className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
          label: 'Asignado'
        };
      case 'maintenance':
        return {
          icon: <Wrench className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
          label: 'Mantenimiento'
        };
      default:
        return {
          icon: <CheckCircle2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />,
          label: 'Desconocido'
        };
    }
  };

  const { icon, label } = getIconAndLabel();
  const variant = getBadgeVariant();

  return (
    <Badge variant={variant} className={`flex items-center ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}>
      {icon}
      {label}
    </Badge>
  );
}
