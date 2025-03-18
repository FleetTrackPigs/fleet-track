
import { Badge } from "@/components/ui/badge";

interface DriverStatusBadgeProps {
  status: 'active' | 'inactive';
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  if (status === 'active') {
    return (
      <Badge className="bg-flota-green">Activo</Badge>
    );
  }
  
  return (
    <Badge variant="destructive">Inactivo</Badge>
  );
}
