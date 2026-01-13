import { useState, useEffect, use, useCallback } from "react";
import { auditoriaService, Auditor } from "../services/auditoriaServices";

export function useAuditores() {
  const [auditores, setAuditores] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const cargarAuditores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await auditoriaService.getAuditores();
      setAuditores(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los auditores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarAuditores();
  }, [cargarAuditores]);



  return { auditores, loading, error, cargarAuditores };
}
