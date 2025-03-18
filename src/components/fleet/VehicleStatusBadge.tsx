
import { Badge } from "@/components/ui/badge";

interface VehicleStatusBadgeProps {
  status: 'available' | 'assigned';
}

export function VehicleStatusBadge({ status }: VehicleStatusBadgeProps) {
  if (status === 'available') {
    return (
      <Badge className="bg-flota-green">Disponible</Badge>
    );
  }
  
  return (
    <Badge variant="secondary">Asignado</Badge>
  );
}
