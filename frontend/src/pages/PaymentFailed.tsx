import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailed = () => {
  // Opcional: Leer parámetros de URL para mostrar el error (ej. ?error=PAYMENT_REJECTED)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Pago Fallido</h1>
        <p className="text-lg text-gray-700 mb-6">Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.</p>
        <Link 
          to="/eventos" // Lo mandamos de vuelta a la lista de eventos
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
        >
          Volver a Eventos
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;