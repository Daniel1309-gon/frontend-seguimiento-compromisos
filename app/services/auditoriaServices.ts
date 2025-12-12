import { create } from "domain";
import api from "./api";
import { get } from "http";

export interface Auditor{
    aud_user: string;
    aud_name: string;
}

export interface Auditoria{
    id_aud: number;
    topic: string;
    area: string;
    date_onbase: string;
    radicate_onbase: string;
    user_aud: string
    mejoras?: any[]
}

export const auditoriaService = {
    getAuditores: async () => {
        const response = await api.get<Auditor[]>("/auditors/");
        return response.data;
    },

    createAuditor: async(data: Auditor) => {
        const response = await api.post<Auditor>("/auditors/", data);
        return response.data;
    },

    createAuditoria: async(data: Omit<Auditoria, 'id_aud' | 'date_onbase'>) => {
        const response = await api.post<Auditoria>("/auditorias/", data);
        return response.data;
    },

    getAuditorias: async() => {
        const response = await api.get<Auditoria[]>("/auditorias/");
        return response.data;
    },
};