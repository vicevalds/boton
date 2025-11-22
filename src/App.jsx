import React, { useState, useEffect } from 'react';
import RecordButton from './components/RecordButton';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    }
  };

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
        await fetchRecordings();
      }
    } catch (error) {
      console.error('Error uploading recording:', error);
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

        {recordings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-24 font-bold text-gray12 text-center">
              Grabaciones
            </h2>
            <div className="space-y-3">
              {recordings.map((recording) => (
                <AudioPlayer
                  key={recording.filename}
                  filename={recording.filename}
                  timestamp={recording.timestamp}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

