// API route for supported chains
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '1inch API key not configured' });
    }

    const response = await fetch('https://api.1inch.dev/portfolio/portfolio/v5.0/general/supported_chains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Supported chains API error:', error);
    res.status(500).json({ error: error.message });
  }
} 