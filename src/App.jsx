import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import UpgradeButton from './components/UpgradeButton';

function App() {
  const [user, setUser] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);

  const fetchFolders = async () => {
    if (!user?.is_premium) {
      setFolders([]);
      return;
    }

    try {
      const res = await fetch(`https://misnotasweb.free.nf/api/folders.php?user_id=${user.id}`);
      const data = await res.json();
      setFolders(data.data || []);
    } catch (error) {
      console.error('Error al cargar carpetas:', error);
      setFolders([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user?.id, user?.is_premium]);

  // Función para manejar el upgrade a Premium
  const handleUpgrade = () => {
    // Actualizamos el estado local para que la UI refleje el nuevo rol
    setUser({ ...user, is_premium: true });
  };

  // 1. Si no hay usuario, mostramos el login/registro
  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-200 overflow-hidden">
      {/* Sidebar - Ancho fijo con scroll personalizado */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/30 backdrop-blur-md flex flex-col shadow-2xl">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <Sidebar
            user={user}
            folders={folders}
            onFolderSelect={setFolderId}
            refreshData={fetchFolders}
          />
        </div>

        {/* Upgrade Call-to-action fijo abajo */}
        {!user.is_premium && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <UpgradeButton user={user} onUpgrade={handleUpgrade} />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/20 via-[#0B0F19] to-[#0B0F19]">
        
        {/* Top Bar de Usuario */}
        <header className="h-16 border-b border-slate-800/60 flex items-center justify-end px-8 gap-6 bg-slate-900/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400">@{user.username}</span>
            <div className="h-8 w-px bg-slate-800" />
            <button
              onClick={() => setUser(null)}
              className="text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-900/50 transition-all duration-300"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Área del Editor */}
        <section className="flex-1 overflow-hidden p-6">
          <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/20 shadow-inner overflow-hidden">
            <NoteEditor 
              user={user} 
              folderId={folderId} 
              folders={folders} 
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;