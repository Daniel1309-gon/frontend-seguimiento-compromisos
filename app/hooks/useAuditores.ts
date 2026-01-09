import { useState, useEffect, use } from "react";
import { auditoriaService, Auditor } from "../services/auditoriaServices";

export function useAuditores() {
  const [auditores, setAuditores] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const cargarAuditores = async () => {
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
    };

    cargarAuditores();
  }, []);

  return { auditores, loading, error };
}
