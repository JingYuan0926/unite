// API route for current portfolio value
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { addresses, chain_id, use_cache } = req.body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Addresses array is required' });
    }

    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '1inch API key not configured' });
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    addresses.forEach(address => queryParams.append('addresses', address));
    if (chain_id) queryParams.append('chain_id', chain_id.toString());
    if (use_cache !== undefined) queryParams.append('use_cache', use_cache.toString());

    const url = `https://api.1inch.dev/portfolio/portfolio/v5.0/general/current_value?${queryParams.toString()}`;

    const response = await fetch(url, {
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
    console.error('Current value API error:', error);
    res.status(500).json({ error: error.message });
  }
} 