import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const effectTarget = `        fetch('http://localhost:3001/api/upgrade-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId })
        }).then(() => {
          // Remove the query string
          window.history.replaceState({}, document.title, window.location.pathname);
          alert('Payment Successful! You are now a Premium Member. You can use the camera!');
        });`;

const effectReplacement = `        fetch('http://localhost:3001/api/upgrade-success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId })
        }).then(() => {
          // Remove the query string immediately so it doesn't double-fire
          window.history.replaceState({}, document.title, window.location.pathname);
          // Update the local state instantly so the camera unlocks without a refresh!
          setProfile(prev => prev ? { ...prev, tier: 'premium' } : { id: uId, tier: 'premium' });
          alert('Payment Successful! You are now a Premium Member. You can use the camera!');
        });`;

content = content.replace(effectTarget, effectReplacement);
fs.writeFileSync('src/App.jsx', content);
