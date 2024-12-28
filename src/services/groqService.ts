const GROQ_API_KEY = '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';

export async function analyzeWithGroq(message: string, context: string) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant spécialisé en analyse de données. Contexte des données : ${context}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erreur Groq API:', error);
    return "Désolé, je n'ai pas pu analyser les données pour le moment.";
  }
}