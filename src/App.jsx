import React, { useState } from 'react';
import RecordButton from './components/RecordButton';

function App() {
  const [loading, setLoading] = useState(false);
  const [serverLog, setServerLog] = useState(null);

  const handleRecordingComplete = async (audioBlob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar la respuesta del servidor externo en el log
        if (data.externalResponse) {
          setServerLog({
            timestamp: new Date().toISOString(),
            response: data.externalResponse,
          });
        }
      }
    } catch (error) {
      console.error('Error uploading recording:', error);
      setServerLog({
        timestamp: new Date().toISOString(),
        response: {
          success: false,
          error: error.message,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray1 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">

        <div className="flex-center">
          <RecordButton onRecordingComplete={handleRecordingComplete} />
        </div>

        {loading && (
          <div className="text-center text-gray11">
            Subiendo grabación...
          </div>
        )}
      </div>

      {/* Log sutil del servidor */}
      {serverLog && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto">
          <div className="bg-gray2 border border-gray4 rounded-8 p-3 shadow-lg text-12 font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray11 text-10">
                {new Date(serverLog.timestamp).toLocaleTimeString('es-ES')}
              </span>
              <button
                onClick={() => setServerLog(null)}
                className="text-gray9 hover:text-gray11 text-14 leading-none px-2"
              >
                ×
              </button>
            </div>
            <div className="text-gray12">
              {serverLog.response.success ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    Servidor externo: {serverLog.response.status} {serverLog.response.statusText}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-red-500">✗</span>
                  <span>
                    Error: {serverLog.response.error || 'Error desconocido'}
                  </span>
                </div>
              )}
              {serverLog.response.body && (
                <div className="mt-1 text-gray10 text-10 truncate">
                  {serverLog.response.body}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

