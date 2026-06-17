// frontend/src/components/NoteEditor.jsx
import { CheckCheck, FolderOpen, NotepadText, Trash2, Save, AlertCircle, Circle, CircleDot } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import UpgradeButton from './UpgradeButton';
export default function NoteEditor({ user, folderId, folders }) {
    const [notes, setNotes] = useState([]);
    const [totalNoteCount, setTotalNoteCount] = useState(0);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newPriority, setNewPriority] = useState('bajo');
    const [newFolderId, setNewFolderId] = useState('null');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const saveTimeouts = useRef({});

    const fetchData = async () => {
        try {
            const url = new URL('https://misnotasweb.free.nf/api/notes.php');
            url.searchParams.append('user_id', user.id);
            if (folderId !== null) {
                url.searchParams.append('folder_id', folderId);
            }

            const res = await fetch(url.toString());
            const data = await res.json();
            setNotes(data.data || []);
        } catch (error) {
            console.error('Error al cargar notas:', error);
        }
    };

    const fetchNoteCount = async () => {
        try {
            const url = new URL('https://misnotasweb.free.nf/api/notes.php');
            url.searchParams.append('user_id', user.id);
            const res = await fetch(url.toString());
            const data = await res.json();
            setTotalNoteCount((data.data || []).length);
        } catch (error) {
            console.error('Error al contar notas:', error);
        }
    };

    const updateNote = async (note) => {
        if (!note?.id) return;

        await fetch('https://misnotasweb.free.nf/api/notes.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: note.id,
                user_id: user.id,
                title: note.title ?? 'Sin título',
                content: note.content ?? '',
                priority: note.priority ?? 'bajo',
                folder_id: note.folder_id === null ? 'null' : note.folder_id
            })
        });

        fetchData();
        fetchNoteCount();
    };

    const createNote = async () => {
        setError('');
        setSuccess('');

        if (!newTitle.trim() && !newContent.trim()) {
            setError('El título o el contenido son necesarios para crear una nota.');
            return;
        }

        const response = await fetch('https://misnotasweb.free.nf/api/notes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                title: newTitle || 'Sin título',
                content: newContent || '',
                priority: newPriority,
                folder_id: newFolderId === 'null' ? 'null' : Number(newFolderId)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.error || 'No se pudo crear la nota.');
            return;
        }

        setSuccess('Nota creada correctamente.');
        setNewTitle('');
        setNewContent('');
        setNewPriority('bajo');
        setNewFolderId('null');
        fetchData();
        fetchNoteCount();
    };

    const deleteNote = async (noteId) => {
        await fetch('https://misnotasweb.free.nf/api/notes.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: noteId, user_id: user.id })
        });
        fetchData();
        fetchNoteCount();
    };

    const handleNoteChange = (noteId, field, value) => {
        setNotes((currentNotes) => {
            const updatedNotes = currentNotes.map((note) =>
                note.id === noteId ? { ...note, [field]: value } : note
            );

            const updatedNote = updatedNotes.find((note) => note.id === noteId);
            if (saveTimeouts.current[noteId]) {
                clearTimeout(saveTimeouts.current[noteId]);
            }

            saveTimeouts.current[noteId] = setTimeout(() => {
                if (updatedNote) {
                    updateNote(updatedNote);
                }
            }, 900);

            return updatedNotes;
        });
    };

    useEffect(() => {
        if (user) {
            fetchData();
            fetchNoteCount();
        }
    }, [folderId, user?.id]);

    const freeNoteLimitReached = !user.is_premium && totalNoteCount >= 10;

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <h1 className="text-4xl font-bold text-white mb-2 mt-12">
                {folderId !== null ? <FolderOpen color='#ffffff' size="40"/> : 
                <NotepadText color='#0099ff' size="50"/> }
                <span>Notas</span>
            </h1>
            <h1>
                
                
                
            </h1>
            <p className="text-slate-400 mb-8 text-sm">Crea, edita y organiza tus notas con facilidad</p>

            <div className="mb-8 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">
                        <CheckCheck color='#0099ff'/>
                    </span> Crear nueva nota
                </h3>

                {error && <p className="mb-3 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
                {success && <p className="mb-3 text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{success}</p>}

                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Título (opcional)"
                    />
                    <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                        <option value="bajo">  Baja Prioridad</option>
                        <option value="medio"> Media Prioridad</option>
                        <option value="urgente"> Urgente</option>
                    </select>
                </div>

                <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 resize-none min-h-[120px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all mb-4"
                    placeholder="Escribe el contenido de tu nota aquí..."
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                        value={newFolderId}
                        onChange={(e) => setNewFolderId(e.target.value)}
                        className="w-full max-w-sm bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                        <option value="null"><FolderOpen color='#ffffff' size="40">Sin carpeta</FolderOpen></option>
                        {folders?.map((folder) => (
                            <option key={folder.id} value={folder.id}>
                                 {folder.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={createNote}
                        disabled={freeNoteLimitReached}
                        className="w-full max-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400"
                    >
                         Crear nota
                    </button>
                </div>

                {!user.is_premium && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-slate-300">
                                Notas gratis: <span className="font-bold text-yellow-400">{totalNoteCount}/10</span>
                            </p>
                            <p className="text-xs text-slate-500">Actualiza a Premium para ilimitadas</p>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all" style={{ width: `${(totalNoteCount / 10) * 100}%` }}></div>
                        </div>
                    </div>
                )}

                {freeNoteLimitReached && (
                    <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <span className="text-xl"></span>
                        <div>
                            <p className="text-sm font-semibold text-red-400">Límite alcanzado</p>
                            <p className="text-xs text-red-300">Has llegado al máximo de 10 notas. Actualiza a Premium para crear más.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 pb-8">
                {notes.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-4"></p>
                        <p className="text-slate-400 text-lg">No hay notas aún</p>
                        <p className="text-slate-500 text-sm mt-2">Crea tu primera nota usando el formulario de arriba</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className={`rounded-xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ${note.priority === 'urgente'
                                    ? 'border-red-500/50 hover:border-red-500'
                                    : note.priority === 'medio'
                                        ? 'border-amber-500/50 hover:border-amber-500'
                                        : 'border-emerald-500/50 hover:border-emerald-500'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <input
                                    type="text"
                                    value={note.title || ''}
                                    onChange={(e) => handleNoteChange(note.id, 'title', e.target.value)}
                                    className="flex-1 bg-transparent text-white text-xl font-bold focus:outline-none border-b-2 border-transparent hover:border-slate-600 focus:border-blue-500 pb-2 transition-colors"
                                    placeholder="Título de la nota"
                                />
                                <div className="flex gap-2 ml-4">
                                    {note.priority === 'urgente' && <span className="text-lg"></span>}
                                    {note.priority === 'medio' && <span className="text-lg"></span>}
                                    {note.priority === 'bajo' && <span className="text-lg"></span>}
                                </div>
                            </div>

                            <textarea
                                value={note.content || ''}
                                onChange={(e) => handleNoteChange(note.id, 'content', e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-white resize-none min-h-[120px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all mb-4 placeholder-slate-500"
                                placeholder="Contenido de la nota..."
                            />

                            <div className="grid gap-3 sm:grid-cols-3 mb-4">
                                <select
                                    value={note.folder_id ?? 'null'}
                                    onChange={(e) =>
                                        handleNoteChange(
                                            note.id,
                                            'folder_id',
                                            e.target.value === 'null' ? null : Number(e.target.value)
                                        )
                                    }
                                    className="bg-slate-700 border border-slate-600 text-sm text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                >
                                    <option value="null"> Sin carpeta</option>
                                    {folders?.map((folder) => (
                                        <option key={folder.id} value={folder.id}>
                                             {folder.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={note.priority || 'bajo'}
                                    onChange={(e) => handleNoteChange(note.id, 'priority', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 text-sm text-white p-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                >
                                    <option value="bajo"> Baja</option>
                                    <option value="medio"> Media</option>
                                    <option value="urgente"> Urgente</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => deleteNote(note.id)}
                                    className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 font-medium text-sm"
                                >
                                     Eliminar
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <span></span> Los cambios se guardan automáticamente
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}