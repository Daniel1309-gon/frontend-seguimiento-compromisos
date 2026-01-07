'use client';
import React, { useState } from 'react';
import { OpMejora, auditoriaService } from '@/app/services/auditoriaServices';
import { ChevronDown, ChevronUp, Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
    hallazgo: OpMejora;
    onUpdate: () => void;
}

export default function OpMejoraItem({ hallazgo, onUpdate }: Props) {
    const [expanded, setExpanded] = useState(false);
    
    // Estados del formulario
    const [action, setAction] = useState("");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(false);

    const hasCompromiso = !!hallazgo.compromisos;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await auditoriaService.createCompromiso(hallazgo.id_op, {
                action,
                deadline: deadline
            });
            onUpdate(); // Recargar para mostrar la vista de "Solo Lectura"
        } catch (error) {
            alert("Error al guardar compromiso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            {/* Cabecera del Hallazgo */}
            <div className="p-6 border-l-4 border-l-orange-500 flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 text-lg">{hallazgo.description}</p>
                    
                    {/* Badge de Estado */}
                    <div className="mt-3">
                        {hasCompromiso ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                                <CheckCircle2 size={12} /> Compromiso Definido
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium">
                                <AlertCircle size={12} /> Sin Compromiso
                            </span>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="ml-4 text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition"
                >
                    {expanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </button>
            </div>

            {/* Zona Expandible */}
            {expanded && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
                    
                    {/* CASO A: YA EXISTE COMPROMISO (Modo Lectura) */}
                    {hasCompromiso ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Compromiso Actual</h4>
                            <p className="text-gray-800 dark:text-white font-medium mb-1">
                                {hallazgo.compromisos?.action}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar size={14}/>
                                <span>Fecha límite: {hallazgo.compromisos?.deadline}</span>
                                <span className="bg-gray-100 dark:bg-gray-700 px-2 rounded text-xs">
                                    {hallazgo.compromisos?.estado}
                                </span>
                            </div>
                        </div>
                    ) : (
                        
                    /* CASO B: NO EXISTE COMPROMISO (Modo Creación) */
                        <form onSubmit={handleSave} className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Definir Compromiso</h4>
                            <div className="flex flex-col md:flex-row gap-2">
                                <input 
                                    type="text" 
                                    placeholder="¿Qué se va a hacer para corregir esto?" 
                                    className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={action}
                                    onChange={e => setAction(e.target.value)}
                                    required
                                />
                                <input 
                                    type="date" 
                                    className="md:w-40 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    required
                                />
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:py-0 rounded text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Guardando...' : <><Save size={16}/> Guardar</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}