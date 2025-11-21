// src/components/events/EventAIWidget.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface EventAIWidgetProps {
  eventId: string;
}

const EventAIWidget = ({ eventId }: EventAIWidgetProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      // Llamamos a tu nuevo endpoint
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/events/${eventId}/ask-ai/`,
        { question }
      );
      setAnswer(response.data.answer);
    } catch (err) {
      console.error("Error AI:", err);
      setError('Lo siento, no pude procesar tu pregunta en este momento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border border-indigo-100 dark:border-gray-700 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {/* Ícono de Destello/Magia */}
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          ¿Dudas sobre el evento?
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Pregúntale a nuestra IA cualquier detalle (horarios, parqueadero, edad mínima...).
      </p>

      <form onSubmit={handleAsk} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ej: ¿Se permiten mascotas?"
          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </form>

      {/* Área de Respuesta */}
      {answer && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-purple-100 dark:border-gray-600 animate-fade-in">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            <span className="font-bold text-purple-600">IA:</span> {answer}
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default EventAIWidget;