// frontend/src/components/Auth.jsx
import { useState } from 'react';
import {Ghost, HeartCrack, Leaf} from 'lucide-react'
export default function Auth({ onLoginSuccess }) {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // frontend/src/components/Auth.jsx
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Ajuste: Usamos la variable de entorno definida en Vercel
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: isRegister ? 'register' : 'login',
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error');
            }

            if (isRegister) {
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                setIsRegister(false);
            } else {
                onLoginSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4 font-sans selection:bg-blue-500/30">
        {/* Fondo con efecto sutil */}
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent_70%)] opacity-50" />
        
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-3xl shadow-inner">
            
            {isRegister ? 
                <Ghost color='#FFFFFF' size='70px' />
                : <Leaf color='#FFFFFF' size='70px'/>}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {isRegister ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-slate-400 text-sm">
            {isRegister ? 'Empieza a organizar tus ideas hoy' : 'Accede para gestionar tus notas'}
            </p>
        </div>
        
        {/* Error Alert */}
        {error && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-200">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Usuario</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-600"
                placeholder="juan_perez"
                required
            />
            </div>
            
            <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Contraseña</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 hover:border-slate-600"
                placeholder="••••••••"
                required
            />
            </div>

            <button
            type="submit"
            className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
            <span className="relative z-10">{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
        </form>

        {/* Toggle Link */}
        <button
            onClick={() => setIsRegister(!isRegister)}
            className="mt-8 w-full text-center text-sm text-slate-500 hover:text-blue-400 transition-colors"
        >
            {isRegister 
            ? '¿Ya tienes una cuenta? Inicia sesión' 
            : '¿No tienes cuenta? Crea una gratis'}
        </button>
        </div>
    </div>
    );
}