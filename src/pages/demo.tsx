import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the App component with SSR disabled
const HextraApp = dynamic(() => import('../App'), {
  ssr: false, // Disable server-side rendering for the app
  loading: () => (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      Loading HEXTRA...
    </div>
  )
});

export default function Demo() {
  return <HextraApp />;
}
