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

export interface CompromisoEnProceso {
  id_com: number;
  op_id: number;
  action: string;
  deadline: string;
  estado: string;
  op_description: string;
  aud_id: number;
  topic: string;
  area: string;
  radicate_onbase: string;
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

export interface Comment {
  id_seg: number;
  com_id: number;
  observation: string;
  created_at: string;
  created_by: string;
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

  createComment: async (data: { id_com: number; observation: string }): Promise<Comment> => {
    const response = await api.post(`/follow_up/${data.id_com}/comments/`, { observation: data.observation });
    return response.data;
  },

  

  getCommentsByCompromiso: async (id_com: number): Promise<Comment[]> => {
    const response = await api.get(`/follow_up/${id_com}/comments/`);
    return response.data;
  },

  deleteComment: async (id_seg: number): Promise<void> => {
    await api.delete(`/follow_up/comments/${id_seg}/`);
  },

  getCompromisosEnProceso: async (): Promise<CompromisoEnProceso[]> => {
    const response = await api.get<CompromisoEnProceso[]>(
      "/compromisos/en-proceso/"
    );
    return response.data;
  },

  getCompromisosEnProcesoProximos: async (): Promise<CompromisoEnProceso[]> => {
    const response = await api.get<CompromisoEnProceso[]>(
      "/compromisos/en-proceso/proximos/"
    );
    return response.data;
  },

  getAlertCompromisos7Dias: async (): Promise<CompromisoEnProceso[]> => {
    const response = await api.get<CompromisoEnProceso[]>(
      "/compromisos/en-proceso/pronto_vencimiento/"
    );
    return response.data;
  },

  getReporteSeguimiento: async (year: number): Promise<Blob> => {
    const response = await api.get(`/stats/reporte-seguimiento/?year=${year}`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
