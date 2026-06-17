import { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function UpgradeButton({ user, onUpgrade }) {
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

        try {
            const response = await fetch(
                'https://misnotasweb.free.nf/api/payments.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        transaction_id: transactionId,
                        amount: 199.0,
                        payment_method: paymentMethod,
                        status
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Error en el servidor");
            }

            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
                onUpgrade();
            }, 2500);

        } catch (err) {
            setError('Error al procesar el pago.');
        } finally {
            setLoading(false);
        }
    };

    console.log("Método:", paymentMethod);

    return (
        <>
            {/* TOASTER */}
            {showToast && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div className="bg-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl border border-emerald-400 animate-pulse">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="font-bold text-xl">
                                ¡Pago realizado!
                            </h3>
                            <p className="text-sm mt-1">
                                Ahora eres usuario Premium
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 rounded-xl border border-slate-700 bg-slate-900 shadow-lg space-y-4">

                <h3 className="text-lg font-bold text-white">
                    Actualizate a Premium
                </h3>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-700 p-3 text-white rounded-lg"
                >
                    <option value="paypal">PayPal</option>
                </select>

                {paymentMethod === 'paypal' ? (
                    <div className="mt-4">
                        <PayPalButtons
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [
                                        {
                                            amount: {
                                                value: "199.00"
                                            }
                                        }
                                    ]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                const details = await actions.order.capture();

                                processBackendPayment(
                                    'COMPLETED',
                                    details.id
                                );
                            }}
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => processBackendPayment()}
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-3 rounded-lg"
                    >
                        {loading
                            ? "Procesando..."
                            : "Actualizar Ahora"}
                    </button>
                )}
            </div>
        </>
    );
}