import { read, utils } from 'xlsx';

export async function parseFile(file: File): Promise<{ headers: string[], data: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        
        // Prendre la première feuille
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convertir en JSON
        const jsonData = utils.sheet_to_json(firstSheet);
        
        // Extraire les en-têtes
        const headers = Object.keys(jsonData[0] || {});

        resolve({
          headers,
          data: jsonData
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur de lecture du fichier'));
    };

    reader.readAsArrayBuffer(file);
  });
}