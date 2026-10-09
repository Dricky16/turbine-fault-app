export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { scentName, brand } = req.body;

  if (!scentName) {
    return res.status(400).json({ error: 'Scent name is required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY on server' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.RESEND_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Scents for Cents <onboarding@resend.dev>',
        to: 'conorodriscoll3@gmail.com', // The app owner's email
        subject: \`New Scent Request: \${scentName}\`,
        html: \`
          <h2>New Scent Request</h2>
          <p>A user has requested a new scent to be added to the database!</p>
          <br/>
          <p><strong>Perfume:</strong> \${scentName}</p>
          <p><strong>Brand:</strong> \${brand || 'Not specified'}</p>
        \`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(400).json({ success: false, error: data.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
