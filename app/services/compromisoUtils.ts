import { auditoriaService } from "./auditoriaServices";

export const getNextCompromisoStatus = (currentStatus: string) =>
  currentStatus === "En proceso" ? "Completado" : "En proceso";

export const toggleCompromisoStatus = async (
  compromisoId: number,
  currentStatus: string,
) => {
  const nuevoEstado = getNextCompromisoStatus(currentStatus);
  await auditoriaService.updateCompromiso(compromisoId, {
    estado: nuevoEstado,
  });
  return nuevoEstado;
};
