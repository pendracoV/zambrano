import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  // Opcional: Aquí podrías leer los parámetros de la URL que envía PayU
  // (ej. ?transactionState=4) para mostrar un mensaje más específico.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
        <p className="text-lg text-gray-700 mb-6">Tu compra ha sido confirmada. Hemos enviado los detalles y tu boleta a tu correo electrónico.</p>
        <Link 
          to="/mis-boletas" 
          className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600"
        >
          Ver mis Boletas
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;