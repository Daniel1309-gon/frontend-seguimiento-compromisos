import api from "./api";


export interface Auditor {
  aud_user: string;
  aud_name: string;
}

export interface Auditoria {
  id_aud: number;
  topic: string;
  area: string;
  date_onbase: string;
  radicate_onbase: string;
  user_aud: string;
  mejoras?: OpMejora[];
}

export interface OpMejora {
  id_op: number;
  aud_id: number;
  description: string;
  compromisos?: Compromiso | null;
}

export interface Compromiso {
  id_com: number;
  op_id: number;
  action: string;
  deadline?: string;
  estado?: string;
}

export interface StatsData {
  total_auditorias: number;
  por_auditor: Record<string, number>;
  por_area: Record<string, number>;
  por_semestre: Record<string, number>;
  por_tema: Record<string, number>;
  por_estado_mejora: Record<string, number>;
}

export interface SystemLog {
    id: number;
    table_name: string;
    action: string;
    record_id: string;
    changed_at: string;
    old_data?: string;
    new_data?: string;
    app_user?: string;
}

export const auditoriaService = {
  getAuditores: async () => {
    const response = await api.get<Auditor[]>("/auditors/");
    return response.data;
  },

  createAuditor: async (data: Auditor) => {
    const response = await api.post<Auditor>("/auditors/", data);
    return response.data;
  },

  createAuditoria: async (data: Omit<Auditoria, "id_aud">) => {
    const response = await api.post<Auditoria>("/auditorias/", data);
    return response.data;
  },

  getAuditorias: async () => {
    const response = await api.get<Auditoria[]>("/auditorias/");
    return response.data;
  },

  getAuditoriaById: async (id: number) => {
    const response = await api.get<Auditoria>(`/auditorias/${id}/`);
    return response.data;
  },

  createOpMejora: async (idAuditoria: number, description: string) => {
    const response = await api.post<OpMejora>(
      `/auditorias/${idAuditoria}/mejoras/`,
      { description }
    );
    return response.data;
  },

  createCompromiso: async (
    idOpMejora: number,
    data: { action: string; deadline?: string }
  ) => {
    const response = await api.post<Compromiso>(
      `/mejoras/${idOpMejora}/compromisos/`,
      data
    );
    return response.data;
  },

  deleteAuditoria: async (id_auditoria: number) => {
    await api.delete(`/auditorias/${id_auditoria}/`);
  },

  deleteOpMejora: async (op_id: number) => {
    await api.delete(`/mejoras/${op_id}/`);
  },

  deleteCompromiso: async (compromiso_id: number) => {
    await api.delete(`/compromisos/${compromiso_id}/`);
  },

  updateCompromiso: async (
    compromiso_id: number,
    data: { action?: string; deadline?: string; estado?: string }
  ) => {
    const response = await api.patch<Compromiso>(
      `/compromisos/${compromiso_id}/`,
      data
    );
    return response.data;
  },

  getStatsData: async () => {
    const response = await api.get<StatsData>(`/stats/general/`);
    return response.data;
  },

  getSystemLogs: async () => {
    const response = await api.get<SystemLog[]>(`/admin/logs/`);
    return response.data;
  },

  deleteAuditor: async (aud_user: string) => {
    await api.delete(`/auditors/${aud_user}/`);
  },

  checkIsAdmin: async () => {
    const response = await api.get<boolean>(`/admin/is-admin/`);
    return response.data;
  },
};
