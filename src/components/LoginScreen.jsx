import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import MitutoyoLogo from '../../images/mitutoyo-m.svg';

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === 'Mitutoyo') {
      onLogin();
    } else {
      setError('Incorrect password. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)'
    }}>
      <div className="card animate-fade-in" style={{
        padding: 'var(--space-12)',
        maxWidth: '440px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--gray-200)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-200)'
          }}>
            <img 
              src={MitutoyoLogo} 
              alt="Mitutoyo" 
              style={{
                width: '48px',
                height: '40px'
              }}
            />
          </div>
          <h1 style={{ 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'var(--font-bold)', 
            color: 'var(--gray-900)',
            marginBottom: 'var(--space-2)',
            lineHeight: 1.2
          }}>
            Mitutoyo Prospecting Engine
          </h1>
          <p style={{ 
            color: 'var(--gray-600)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.5,
            fontWeight: 'var(--font-medium)'
          }}>
            Secure access to your advanced data analysis platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--gray-900)',
              marginBottom: 'var(--space-2)'
            }}>
              Password
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: 'var(--space-4)',
                  paddingRight: 'var(--space-10)',
                  border: '2px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-base)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'white',
                  color: 'var(--gray-900)',
                  fontWeight: 'var(--font-medium)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--gray-200)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--space-3)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  color: 'var(--gray-500)',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gray-700)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--gray-500)'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: 'var(--error-500)',
                  borderRadius: '50%'
                }} />
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: 'var(--space-4)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              background: isLoading || !password 
                ? 'var(--gray-200)' 
                : 'var(--primary-600)',
              color: isLoading || !password ? 'var(--gray-500)' : 'white',
              cursor: isLoading || !password ? 'not-allowed' : 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              boxShadow: isLoading || !password ? 'none' : 'var(--shadow-md)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && password) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && password) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Authenticating...
              </>
            ) : (
              <>
                Access Platform
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-8)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--gray-200)'
        }}>
          <p style={{
            color: 'var(--gray-500)',
            fontSize: 'var(--text-xs)',
            margin: 0,
            fontWeight: 'var(--font-medium)'
          }}>
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; 