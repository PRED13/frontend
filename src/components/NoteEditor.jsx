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

    // URL dinámica basada en la variable de entorno configurada en Vercel
    const API_NOTES_URL = `${import.meta.env.VITE_API_URL}/api/notes.php`;

    const fetchData = async () => {
        try {
            const url = new URL(API_NOTES_URL);
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
            const url = new URL(API_NOTES_URL);
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

        await fetch(API_NOTES_URL, {
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

        const response = await fetch(API_NOTES_URL, {
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
        await fetch(API_NOTES_URL, {
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
                {folderId !== null ? <FolderOpen color='#ffffff' size="40"/> : <NotepadText color='#0099ff' size="50"/> }
                <span>Notas</span>
            </h1>
            
            {/* Formulario de creación */}
            <div className="mb-8 rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCheck color='#0099ff'/> Crear nueva nota
                </h3>
                {error && <p className="mb-3 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
                {success && <p className="mb-3 text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{success}</p>}
                
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Título (opcional)" />
                    <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                        <option value="bajo">Baja Prioridad</option>
                        <option value="medio">Media Prioridad</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white resize-none min-h-[120px] mb-4 focus:outline-none focus:border-blue-500 transition-all" placeholder="Escribe el contenido..." />
                
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select value={newFolderId} onChange={(e) => setNewFolderId(e.target.value)} className="w-full max-w-sm bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all">
                        <option value="null">Sin carpeta</option>
                        {folders?.map((folder) => (<option key={folder.id} value={folder.id}>{folder.name}</option>))}
                    </select>
                    <button type="button" onClick={createNote} disabled={freeNoteLimitReached} className="w-full max-w-[200px] bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50">
                        Crear nota
                    </button>
                </div>
            </div>

            {/* Listado de notas */}
            <div className="space-y-4 pb-8">
                {notes.map((note) => (
                    <div key={note.id} className="rounded-xl border-2 border-slate-700 bg-slate-900 p-6 shadow-lg">
                        <input type="text" value={note.title} onChange={(e) => handleNoteChange(note.id, 'title', e.target.value)} className="w-full bg-transparent text-xl font-bold text-white mb-4 focus:outline-none border-b border-transparent focus:border-blue-500" />
                        <textarea value={note.content} onChange={(e) => handleNoteChange(note.id, 'content', e.target.value)} className="w-full bg-slate-800 rounded-lg p-3 text-sm text-white mb-4" />
                        <button onClick={() => deleteNote(note.id)} className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg text-sm">Eliminar</button>
                    </div>
                ))}
            </div>
        </div>
    );
}