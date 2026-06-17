// frontend/src/components/Sidebar.jsx
import { useState } from 'react';

// Ahora usamos la variable de entorno configurada en Vercel
const API_FOLDERS_URL = `${import.meta.env.VITE_API_URL}/api/folders`;

export default function Sidebar({ user, folders, onFolderSelect, refreshData }) {
    // ... el resto de tu código se queda exactamente igual
    const [newFolderName, setNewFolderName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const createFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            const res = await fetch(API_FOLDERS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFolderName, user_id: user.id })
            });
            if (!res.ok) throw new Error('Error al crear carpeta');
            
            setNewFolderName('');
            refreshData();
        } catch (err) {
            console.error("Error al crear carpeta:", err);
        }
    };

    const updateFolder = async (id) => {
        try {
            const res = await fetch(API_FOLDERS_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editName, user_id: user.id })
            });
            if (!res.ok) throw new Error('Error al actualizar carpeta');
            
            setEditingId(null);
            refreshData();
        } catch (err) {
            console.error("Error al actualizar carpeta:", err);
        }
    };

    const deleteFolder = async (id) => {
        if (!confirm("¿Eliminar esta carpeta? Las notas dentro quedarán sin categoría.")) return;
        
        try {
            // Construcción segura de la URL con parámetros
            const url = new URL(API_FOLDERS_URL);
            url.searchParams.append('user_id', user.id);
            url.searchParams.append('id', id);

            const res = await fetch(url.toString(), { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar carpeta');
            
            refreshData();
        } catch (err) {
            console.error("Error al eliminar carpeta:", err);
        }
    };

    return (
        <div className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 p-6 h-screen flex flex-col shadow-xl">
            <div className="mb-8">
                <h2 className="text-white font-bold text-lg mb-2">Mis Notas</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {user.is_premium ? 'Premium' : 'Gratis'}
                </p>
            </div>

            <nav className="flex-1 space-y-1">
                <button
                    onClick={() => onFolderSelect(null)}
                    className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 font-medium text-sm flex items-center gap-2"
                >
                    <span className="text-base">📝</span>
                    Todas las notas
                </button>

                {folders.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <p className="text-xs uppercase text-slate-500 font-semibold px-4 mb-3 tracking-wider">Carpetas</p>
                        {folders.map(f => (
                            <div key={f.id} className="flex justify-between items-center group hover:bg-slate-700/30 rounded-lg px-3 py-2 transition-colors duration-200">
                                {editingId === f.id ? (
                                    <input
                                        className="bg-slate-700 text-white text-sm w-full p-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={() => updateFolder(f.id)}
                                        autoFocus
                                    />
                                ) : (
                                    <button
                                        onClick={() => onFolderSelect(f.id)}
                                        className="text-sm text-slate-300 hover:text-white transition-colors duration-200 truncate flex items-center gap-2 flex-1 font-medium"
                                    >
                                        <span className="text-base">📁</span>
                                        {f.name}
                                    </button>
                                )}

                                {user.is_premium && editingId !== f.id && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                                        <button onClick={() => { setEditingId(f.id); setEditName(f.name); }} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 hover:bg-slate-600 rounded transition-colors">✏️</button>
                                        <button onClick={() => deleteFolder(f.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 hover:bg-red-500/20 rounded transition-colors">🗑️</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </nav>

            {user.is_premium && (
                <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                    <input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nueva carpeta..."
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                        onClick={createFolder}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        + Crear carpeta
                    </button>
                </div>
            )}
        </div>
    );
}