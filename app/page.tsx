"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Set the video to play at half speed (0.5)
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (question.trim()) {
      // Encode the question to make it URL-safe
      const encodedQuestion = encodeURIComponent(question);
      
      // Navigate to the chat page with the question as a query parameter
      window.location.href = `/chat?q=${encodedQuestion}`;
    }
  };

  return (
    <>
      {/* Absolutely positioned menu with inline styles */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '62px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
          borderRadius: '0 0 16px 16px',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/logo.png" 
              alt="Agora Logo" 
              style={{ 
                width: '48px', 
                height: '48px',
                objectFit: 'contain',
                filter: 'grayscale(100%)'
              }}
            />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b' }}>Agora</span>
        </div>

        {/* Right side with links and button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="#" style={{ 
              color: '#475569', 
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontSize: '16px'
            }}>
              Iniciar Sesión
            </a>
            <button style={{ 
              background: 'linear-gradient(to right, #ec4899, #8b5cf6)', 
              color: 'white', 
              padding: '8px 20px', 
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.3s ease',
              boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #d946ef, #8b5cf6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #ec4899, #8b5cf6)';
            }}
            >
              Registrate
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-screen relative">
        {/* Video Background Container - Lowest z-index */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -2,
            overflow: 'hidden',
          }}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/video-background.mp4" type="video/mp4" />
          </video>
        </div>

        {/* White Overlay - Between video and content */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: -1,
          }}
        />

        {/* Content - Above both video and overlay */}
        <div className="min-h-screen relative z-10" style={{ paddingTop: '54px' }}>
          {/* Main hero section - with absolute positioning for exact middle placement */}
          <div className="relative" style={{ height: 'calc(100vh - 54px)' }}>
            {/* Hero container with absolute centering */}
            <div className="w-full px-6" style={{ 
              position: 'absolute', 
              top: '50%',
              transform: 'translateY(-50%)',
              width: '100%'
            }}>
              {/* Hero content */}
              <div className="flex flex-col md:flex-row">
                {/* Left side - strictly constrained to 50% width */}
                <div style={{ 
                  width: '100%', 
                  maxWidth: '50%',
                  paddingRight: '2rem'
                }}>
                  <div className="text-left">
                    {/* This heading is positioned exactly in the middle */}
                    <h1 
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 30%, #8b5cf6 70%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'block',
                        fontSize: '2.8rem',
                        fontWeight: 'bold',
                        lineHeight: '1.1',
                        paddingBottom: '5px',
                        borderBottom: '1px solid transparent',
                        wordWrap: 'break-word',
                        maxWidth: '100%',
                        marginBottom: '0'
                      }}
                    >
                      Descubre la historia y el presente de Chile
                    </h1>
                    {/* Elements below the centered heading */}
                    <div style={{ 
                      paddingTop: '20px',
                      paddingBottom: '20px',
                      borderBottom: '1px solid transparent'
                    }}>
                      <p style={{ 
                        maxWidth: '100%',
                        fontSize: '1.29rem',
                        color: '#334155',
                        margin: '0'
                      }}>
                        Pregunta sobre política, economía y legislación chilena
                      </p>
                    </div>
                    
                    {/* SEARCH FORM - Square with rounded edges */}
                    <div style={{ 
                      width: '80%',
                      paddingTop: '20px',
                      maxWidth: '80%'
                    }}>
                      <form onSubmit={handleSubmit}>
                        <div style={{ 
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          maxWidth: '100%'
                        }}>
                          {/* Input field - Square with rounded edges */}
                          <input
                            type="text"
                            placeholder="¿Cual fue el impacto del COVID sobre la desigualdad en Chile?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            style={{
                              height: '36px',
                              flex: '1',
                              border: '1px solid #e2e8f0',
                              borderRight: 'none',
                              borderTopLeftRadius: '8px',
                              borderBottomLeftRadius: '8px',
                              padding: '0 16px',
                              fontSize: '14px',
                              outline: 'none',
                              backgroundColor: 'white',
                              color: 'black'
                            }}
                          />
                          
                          {/* Search button - Icon only, lighter gray */}
                          <button 
                            type="submit"
                            style={{
                              height: '36px',
                              backgroundColor: '#94a3b8',
                              color: 'white',
                              border: 'none',
                              borderTopRightRadius: '8px',
                              borderBottomRightRadius: '8px',
                              padding: '0 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {/* Magnifying glass icon only */}
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                
                {/* Right side - empty */}
                <div style={{ width: '100%', maxWidth: '50%' }} className="hidden md:block">
                  {/* Content removed as requested */}
                </div>
              </div>
            </div>
          </div>

          {/* Logo Carousel Section - Moving from right to left */}
          <section style={{
            padding: '25px 0',
            backgroundColor: '#f8fafc',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '20px',
            marginBottom: '0'
          }}>
            {/* Animated Logo Track */}
            <div className="logo-track" style={{
              display: 'flex',
              animation: 'scroll 30s linear infinite',
              width: 'max-content'
            }}>
              {/* First set of logos */}
              {[
                { name: 'Libertad y Desarrollo', color: '#000000', logo: '/logo_lyd.png' },
                { name: 'Banco Central', color: '#003087', logo: '/logo_banco_central.png' },
                { name: 'Ministerio de Hacienda', color: '#00843D' },
                { name: 'Universidad de Chile', color: '#0032A0' },
                { name: 'Cámara de Diputados', color: '#B22234', logo: '/logo_diputados.png' },
                { name: 'Pontificia Universidad Católica', color: '#8A1538' },
                { name: 'CEPAL', color: '#009EDB', logo: '/logo_cepal.png' },
                { name: 'BID', color: '#F7A800' },
                { name: 'Ciper', color: '#E53935', logo: '/logo_ciper.png' },
                { name: 'BCN', color: '#1565C0', logo: '/bcn_logo.png' },
                { name: 'Congreso Nacional', color: '#001489' },
                { name: 'CEP', color: '#652C8F', logo: '/logo_CEP.png' }
              ].map((logo, index) => (
                <div key={`logo-1-${index}`} style={{
                  minWidth: '100px',
                  height: '100px',
                  margin: '0 25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  padding: '0 12px'
                }}>
                  {logo.logo ? (
                    <img 
                      src={logo.logo} 
                      alt={logo.name} 
                      style={{ 
                        height: '65px',
                        maxWidth: '80%',
                        objectFit: 'contain',
                        filter: 'grayscale(100%)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      color: logo.color,
                      fontWeight: '600',
                      fontSize: '16px',
                      textAlign: 'center',
                      width: '100%',
                      padding: '0 5px'
                    }}>
                      {logo.name}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Duplicate set of logos to ensure smooth infinite scrolling */}
              {[
                { name: 'Libertad y Desarrollo', color: '#000000', logo: '/logo_lyd.png' },
                { name: 'Banco Central', color: '#003087', logo: '/logo_banco_central.png' },
                { name: 'Ministerio de Hacienda', color: '#00843D' },
                { name: 'Universidad de Chile', color: '#0032A0' },
                { name: 'Cámara de Diputados', color: '#B22234', logo: '/logo_diputados.png' },
                { name: 'Pontificia Universidad Católica', color: '#8A1538' },
                { name: 'CEPAL', color: '#009EDB', logo: '/logo_cepal.png' },
                { name: 'BID', color: '#F7A800' },
                { name: 'Ciper', color: '#E53935', logo: '/logo_ciper.png' },
                { name: 'BCN', color: '#1565C0', logo: '/bcn_logo.png' },
                { name: 'Congreso Nacional', color: '#001489' },
                { name: 'CEP', color: '#652C8F', logo: '/logo_CEP.png' }
              ].map((logo, index) => (
                <div key={`logo-2-${index}`} style={{
                  minWidth: '100px',
                  height: '100px',
                  margin: '0 25px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  padding: '0 12px'
                }}>
                  {logo.logo ? (
                    <img 
                      src={logo.logo} 
                      alt={logo.name} 
                      style={{ 
                        height: '65px',
                        maxWidth: '80%',
                        objectFit: 'contain',
                        filter: 'grayscale(100%)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      color: logo.color,
                      fontWeight: '600',
                      fontSize: '16px',
                      textAlign: 'center',
                      width: '100%',
                      padding: '0 5px'
                    }}>
                      {logo.name}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CSS Animation for the logo carousel */}
            <style jsx>{`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .logo-track {
                animation: scroll 30s linear infinite;
              }
              .logo-track:hover {
                animation-play-state: paused;
              }
            `}</style>
          </section>

          {/* Features Section - RESPONSIVE GRID */}
          <section style={{
            padding: '64px 0',
            backgroundColor: 'white',
            marginTop: '0'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px'
            }}>
              {/* Section Title */}
              <div style={{
                textAlign: 'center',
                marginBottom: '80px'
              }}>
                <h2 style={{
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>Conocimiento político y económico al alcance de todos</h2>
                <p style={{
                  fontSize: '18px',
                  color: '#64748b',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>Agora democratiza el acceso a información sobre Chile, permitiéndote obtener respuestas a tus preguntas más importantes.</p>
              </div>
              
              {/* Responsive Grid Card Container */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                width: '100%'
              }}>
                {/* Card 1: Semantic Search */}
                <div 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    // Add the pseudo overlay
                    e.currentTarget.style.backgroundColor = 'rgba(252, 231, 243, 0.6)'; // Very light pink background
                    e.currentTarget.style.transform = 'translateY(-5px)'; // Small lift effect
                  }}
                  onMouseOut={(e) => {
                    // Remove the overlay
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L16.65 16.65" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px'
                  }}>Datos Completos</h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.5'
                  }}>Accede a una extensa base de datos sobre política, economía y legislación chilena actualizada constantemente.</p>
                </div>
                
                {/* Card 2: PDF Processing */}
                <div 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    // Add the pseudo overlay
                    e.currentTarget.style.backgroundColor = 'rgba(252, 231, 243, 0.6)'; // Very light pink background
                    e.currentTarget.style.transform = 'translateY(-5px)'; // Small lift effect
                  }}
                  onMouseOut={(e) => {
                    // Remove the overlay
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H9H8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px'
                  }}>Análisis Profundo</h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.5'
                  }}>Obtén análisis detallados que te ayudarán a comprender mejor la realidad política y económica de Chile.</p>
                </div>
                
                {/* Card 3: AI-Powered Analysis */}
                <div 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    // Add the pseudo overlay
                    e.currentTarget.style.backgroundColor = 'rgba(252, 231, 243, 0.6)'; // Very light pink background
                    e.currentTarget.style.transform = 'translateY(-5px)'; // Small lift effect
                  }}
                  onMouseOut={(e) => {
                    // Remove the overlay
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px'
                  }}>Acceso Universal</h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.5'
                  }}>Diseñado para ser utilizado por cualquier persona, sin importar su nivel de conocimiento técnico o político.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Full width footer */}
        <div style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)',
          borderRadius: '16px 16px 0 0',
          marginTop: '0'
        }}>
          <footer style={{
            padding: '30px 24px',
            maxWidth: '1280px',
            margin: '0 auto',
          }}>
            {/* Top section with horizontal links */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '32px'
            }}>
              <div style={{ minWidth: '150px' }}>
                <h4 className="font-semibold text-slate-900 text-lg mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Changelog</a></li>
                </ul>
              </div>
              <div style={{ minWidth: '150px' }}>
                <h4 className="font-semibold text-slate-900 text-lg mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">About</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Blog</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Careers</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Contact</a></li>
                </ul>
              </div>
              <div style={{ minWidth: '150px' }}>
                <h4 className="font-semibold text-slate-900 text-lg mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Tutorials</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Support</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">API Reference</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Community</a></li>
                </ul>
              </div>
              <div style={{ minWidth: '150px' }}>
                <h4 className="font-semibold text-slate-900 text-lg mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Terms</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Security</a></li>
                  <li><a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
            
            {/* Copyright section */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-slate-500">© 2023 Agora. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}