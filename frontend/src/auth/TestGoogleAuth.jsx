import React from 'react'

const TestGoogleAuth = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        🎯 Google Auth Page Works!
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        This is the Google OAuth authentication page.
      </p>
      <button 
        onClick={() => window.location.href = 'https://crackzone2.onrender.com/api/auth/google'}
        style={{
          backgroundColor: '#fff',
          color: '#000',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        🚀 Continue with Google
      </button>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
        URL: {window.location.href}
      </div>
    </div>
  )
}

export default TestGoogleAuth