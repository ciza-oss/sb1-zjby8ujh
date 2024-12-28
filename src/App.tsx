import React, { useState, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { AnalysisChat } from './components/AnalysisChat';
import { Chart } from './components/Charts';
import { analyzeWithGroq } from './services/groqService';
import { BarChart, LineChart, PieChart, TrendingUp, Share2, Download, Loader2 } from 'lucide-react';

function App() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [activeChart, setActiveChart] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const workerRef = useRef<Worker>();

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setData([]);
    setHeaders([]);
    setProgress(0);

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./workers/dataWorker.ts', import.meta.url), {
        type: 'module'
      });

      workerRef.current.onmessage = (event) => {
        const { type, data: eventData, progress: eventProgress } = event.data;
        
        switch (type) {
          case 'headers':
            setHeaders(eventData);
            break;
          case 'batch':
            setData(prev => [...prev, ...eventData]);
            setProgress(eventProgress);
            break;
          case 'complete':
            setLoading(false);
            break;
          case 'error':
            console.error('Erreur de traitement:', eventData);
            setLoading(false);
            break;
        }
      };
    }

    workerRef.current.postMessage({ file });
  };

  const handleSendMessage = async (message: string) => {
    const dataContext = JSON.stringify({
      sample: data.slice(0, 5),
      totalRows: data.length,
      columns: headers
    });
    
    const response = await analyzeWithGroq(message, dataContext);
    
    setMessages(prev => [...prev, 
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Analyse de Données Pro
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
          <h2 className="text-xl font-semibold mb-4 text-indigo-900">Import de données</h2>
          <FileUpload onFileUpload={handleFileUpload} />
          {loading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-indigo-600">
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Chargement des données...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
              <h2 className="text-xl font-semibold mb-4 text-indigo-900">Visualisation</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button 
                  onClick={() => setActiveChart('bar')}
                  className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                    activeChart === 'bar' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <BarChart className="h-8 w-8" />
                  <span className="mt-2 text-sm">Barres</span>
                </button>
                <button 
                  onClick={() => setActiveChart('line')}
                  className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                    activeChart === 'line' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <LineChart className="h-8 w-8" />
                  <span className="mt-2 text-sm">Lignes</span>
                </button>
                <button 
                  onClick={() => setActiveChart('pie')}
                  className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                    activeChart === 'pie' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <PieChart className="h-8 w-8" />
                  <span className="mt-2 text-sm">Secteurs</span>
                </button>
                <button 
                  onClick={() => setActiveChart('area')}
                  className={`p-4 rounded-lg flex flex-col items-center transition-all ${
                    activeChart === 'area' ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="h-8 w-8" />
                  <span className="mt-2 text-sm">Aires</span>
                </button>
              </div>

              <Chart
                data={data}
                type={activeChart}
                xKey={headers[0]}
                yKey={headers[1]}
              />
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
            <h2 className="text-xl font-semibold mb-4 text-indigo-900">Assistant IA</h2>
            <AnalysisChat
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>

        {data.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-900">Données</h2>
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700">
                  <Share2 className="h-5 w-5" />
                  <span>Partager</span>
                </button>
                <button className="flex items-center space-x-2 text-green-600 hover:text-green-700">
                  <Download className="h-5 w-5" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>
            <DataTable data={data} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;