'use client';

import React, {useEffect, useState, use} from 'react';
import { useRouter } from 'next/navigation';
import { auditoriaService, Auditoria } from '@/app/services/auditoriaServices';
import { Loader2, ArrowLeft, Building, Calendar, FileWarning, Plus } from 'lucide-react';


//next pasa los parametros de la url en el props

export default function AuditoriaDetail({params}: {params: Promise<{id: string}>}) {
    const router = useRouter();
    const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { id } = use(params);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const idNum = parseInt(id);
                const data = await auditoriaService.getAuditoriaById(idNum);
                setAuditoria(data);
            } catch (err) {
                console.error("Error cargando auditoria: ",err);
                alert("No se encontró la auditoría o no tiene permisos para verla.");
                //push redirige a otra pagina
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarDetalle();
        }
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin mr-2" size={40} />
                Cargando...
            </div>
        );
    }

    if (!auditoria) return null;

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-5xl mx-auto'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition cursor-pointer'
                >
                    <ArrowLeft size={20}/>
                    Volver al Dashboard
                </button>
                <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8'>
                    <div className='flex justify-between items-start'>
                        <div>
                            <h1 className='text-3xl font-bold mb-2 text-gray-900'>{auditoria.topic}</h1>
                            <div className='flex gap-4 text-gray-600 test-sm'>
                                <span className='flex items-center gap-1'>
                                    <Building size={16} />
                                    Área: {auditoria.area}
                                </span>
                                <span className='flex items-center gap-1'>
                                    <Calendar size={16} />
                                    Fecha en OnBase: {new Date(auditoria.date_onbase).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className='bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium font-mono'>
                            Radicado OnBase: <span className='font-mono'>{auditoria.radicate_onbase}</span>
                        </div>
                    </div>

                </div>

                <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileWarning className="text-orange-500" />
            Hallazgos / Oportunidades
          </h2>
          <button className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-black transition">
            <Plus size={16} /> Agregar Hallazgo
          </button>
        </div>

        {/* Lista de Mejoras */}
        {!auditoria.mejoras || auditoria.mejoras.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
            <p>No se han registrado hallazgos en esta auditoría.</p>
            <p className="text-sm mt-1">Usa el botón "Agregar Hallazgo" para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditoria.mejoras.map((mejora) => (
              <div key={mejora.id_op} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-orange-400">
                <p className="text-gray-800 text-lg mb-4">{mejora.description}</p>
                
                <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Sin compromisos definidos
                    </span>
                    <button className="text-blue-600 text-sm font-medium hover:underline">
                        Gestionar Compromisos
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
            </div>
        </div>
    );
};