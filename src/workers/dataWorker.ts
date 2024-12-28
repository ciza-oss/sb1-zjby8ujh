import { read, utils } from 'xlsx';

self.onmessage = async (event) => {
  const { file } = event.data;
  
  try {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convertir en JSON
      const jsonData = utils.sheet_to_json(firstSheet);
      
      // Envoyer les en-têtes
      const headers = Object.keys(jsonData[0] || {});
      self.postMessage({
        type: 'headers',
        data: headers
      });

      // Traiter par lots de 1000 lignes
      const batchSize = 1000;
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        const progress = (i / jsonData.length) * 100;
        
        self.postMessage({
          type: 'batch',
          data: batch,
          progress
        });
      }

      self.postMessage({ type: 'complete' });
    };

    reader.onerror = () => {
      self.postMessage({ 
        type: 'error', 
        error: 'Erreur de lecture du fichier' 
      });
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    });
  }
};