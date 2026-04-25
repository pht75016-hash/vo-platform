import { useStore } from '../store/useStore'

export function useVehicles() {
  const vehicles = useStore((s) => s.vehicles)
  const addVehicle = useStore((s) => s.addVehicle)
  const updateVehicle = useStore((s) => s.updateVehicle)
  const deleteVehicle = useStore((s) => s.deleteVehicle)

  return { vehicles, addVehicle, updateVehicle, deleteVehicle }
}
