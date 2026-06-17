// frontend/src/components/UpgradeButton.jsx
// frontend/src/components/UpgradeButton.jsx
import { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

// Cambiamos la URL fija por la variable de entorno
const API_PAYMENTS_URL = `${import.meta.env.VITE_API_URL}/api/payments`;

export default function UpgradeButton({ user, onUpgrade }) {
    // ... el resto del código se queda igual
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    if (user.is_premium) return null;

    const processBackendPayment = async (
        status = 'approved',
        transactionId = 'TX-' + Date.now()
    ) => {
        setLoading(true);
        setError(''); // Limpiar errores previos

        try {
            const response = await fetch(API_PAYMENTS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    transaction_id: transactionId,
                    amount: 199.00,
                    payment_method: paymentMethod,
                    status
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Error al procesar el pago en el servidor");
            }

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                onUpgrade();
            }, 2500);

        } catch (err) {
            console.error("Error en pago:", err);
            setError(err.message || 'Error al procesar el pago.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* TOASTER DE ÉXITO */}
            {showToast && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                    <div className="bg-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl border border-emerald-400 animate-pulse">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="font-bold text-xl">¡Pago realizado!</h3>
                            <p className="text-sm mt-1">Ahora eres usuario Premium</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 rounded-xl border border-slate-700 bg-slate-900 shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-white">Actualízate a Premium</h3>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-700 p-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="paypal">PayPal</option>
                </select>

                {paymentMethod === 'paypal' ? (
                    <div className="mt-4">
                        <PayPalButtons
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [{ amount: { value: "199.00" } }]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                const details = await actions.order.capture();
                                processBackendPayment('COMPLETED', details.id);
                            }}
                            onError={(err) => {
                                console.error("PayPal Error:", err);
                                setError("Hubo un problema con la plataforma de PayPal.");
                            }}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => processBackendPayment()}
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Procesando..." : "Actualizar Ahora"}
                    </button>
                )}
            </div>
        </>
    );
}