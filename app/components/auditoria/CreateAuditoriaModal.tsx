'use client';

import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { auditoriaService } from '@/app/services/auditoriaServices';
import { X, Loader2, Save } from 'lucide-react';
import { on } from 'events';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateAuditoriaModal({ isOpen, onClose, onSuccess }: Props) {
    const { accounts } = useMsal();
    const [loading, setLoading] = useState<boolean>(false);

    const [formData, setFormData] = useState({
        topic: '',
        area: '',
        radicate_onbase: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.topic || !formData.area || !formData.radicate_onbase) {
          alert("Por favor completa todos los campos.");
          return;
      }

      try {
        setLoading(true);

        const currentUserEmail = accounts[0]?.username;

        await auditoriaService.createAuditoria({
            ...formData,
            user_aud: currentUserEmail || ''
        });

        setFormData({
            topic: '',
            area: '',
            radicate_onbase: ''
        });
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error creando auditoria:", error);
        alert("Hubo un error al crear la auditoria. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);  
      }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        
        {/* Botón X para cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >

          <X size={24} />
        </button>

        {/* Título */}
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Nueva auditoría</h2>
            <p className="text-sm text-gray-700 mt-1">Ingresa los datos iniciales de la auditoría.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Campo: Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tema / Título
            </label>
            <input
              type="text"
              autoFocus
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-200 text-gray-700"
              placeholder="Ej. Auditoría ISO 9001 - 2024"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
            />
          </div>

          {/* Campo: Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Auditada
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-200 text-gray-700"
              placeholder="Ej. Recursos Humanos"
              value={formData.area}
              onChange={(e) => setFormData({...formData, area: e.target.value})}
            />
          </div>

          {/* Campo: Radicado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radicado OnBase
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-200 text-gray-700"
              placeholder="Ej. R-2024-0015"
              value={formData.radicate_onbase}
              onChange={(e) => setFormData({...formData, radicate_onbase: e.target.value})}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? 'Guardando...' : 'Crear Auditoría'}
            </button>
          </div>

        </form>
      </div>
    </div>
    );
};