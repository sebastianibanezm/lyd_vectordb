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
          padding: '0 24px',
          boxSizing: 'border-box',
          borderRadius: '0 0 16px 16px',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '150px' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Logo removed from the home page as requested */}
          </div>
        </div>

        {/* Middle navigation items - absolutely positioned for perfect centering */}
        <div style={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '32px',
          justifyContent: 'center'
        }}>
          <a href="#" style={{ 
            color: '#000000', 
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            fontSize: '16px'
          }}>
            Producto
          </a>
          <a href="#" style={{ 
            color: '#000000', 
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            fontSize: '16px'
          }}>
            Precios
          </a>
          <a href="#" style={{ 
            color: '#000000', 
            fontWeight: 500,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            fontSize: '16px'
          }}>
            Contacto
          </a>
        </div>

        {/* Right side with links and button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="#" style={{ 
              color: '#000000', 
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontSize: '16px'
            }}>
              Iniciar Sesión
            </a>
            <button style={{ 
              background: 'white',
              color: 'black', 
              padding: '8px 20px', 
              borderRadius: '0',
              fontWeight: 600,
              fontSize: '16px',
              border: '2px solid #000000',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
              position: 'relative',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
            >
              {/* Pink line at the top of the button */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '2px',
                width: 'calc(100% - 0px)',
                height: '3px',
                backgroundColor: '#ec4899',
                zIndex: 1
              }}></div>
              
              {/* Pink line at the right side of the button */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '3px',
                height: 'calc(100% + 4px)',
                backgroundColor: '#ec4899',
                zIndex: 1
              }}></div>
              
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
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
                        display: 'block',
                        lineHeight: '1.1',
                        paddingBottom: '5px',
                        borderBottom: '1px solid transparent',
                        maxWidth: '100%',
                        marginBottom: '0',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ 
                        width: '70%',
                        margin: '0 auto'
                      }}>
                        <img 
                          src="/logo-long.png" 
                          alt="Agora - Descubre la historia y el presente de Chile" 
                          style={{ 
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </div>
                    </h1>
                    
                    {/* Unified container for text and search input */}
                    <div style={{ 
                      width: '70%',
                      margin: '20px auto 0',
                      position: 'relative',
                      padding: '24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      borderRadius: '0',
                      border: '2px solid #000000',
                      boxSizing: 'border-box'
                    }}>
                      {/* Pink line at the top of the container */}
                      <div style={{
                        position: 'absolute',
                        top: '-4px', /* Position outside the black border */
                        left: '2px', /* Account for left black border */
                        width: 'calc(100% - 0px)', /* Extend to the right edge + 4px */
                        height: '2px',
                        backgroundColor: '#ec4899',
                        zIndex: 1
                      }}></div>
                      
                      {/* Pink line at the right side of the container */}
                      <div style={{
                        position: 'absolute',
                        top: '-4px', /* Extend all the way to the top */
                        right: '-4px', /* Position outside the black border */
                        width: '2px',
                        height: 'calc(100% + 4px)', /* Extend to touch the top pink line */
                        backgroundColor: '#ec4899',
                        zIndex: 1
                      }}></div>
                      
                      {/* Text paragraph */}
                      <p style={{ 
                        width: '100%',
                        fontSize: '1.29rem',
                        color: '#000000',
                        margin: '0 0 24px 0',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}>
                        Leyes, reportajes e investigaciones — todo lo que necesitas para entender Chile.
                      </p>
                      
                      {/* SEARCH FORM - Square with rounded edges */}
                      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div style={{ 
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          margin: 0,
                          padding: 0
                        }}>
                          {/* Input field - Square with rounded edges */}
                          <input
                            type="text"
                            placeholder="¿Cual fue el impacto del COVID sobre la desigualdad en Chile?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            style={{
                              height: '42px',
                              flex: '1',
                              border: '1px solid #e2e8f0',
                              borderRight: 'none',
                              borderTopLeftRadius: '0',
                              borderBottomLeftRadius: '0',
                              padding: '0 16px',
                              fontSize: '14px',
                              outline: 'none',
                              backgroundColor: 'white',
                              color: 'black',
                              margin: 0,
                              boxSizing: 'border-box'
                            }}
                          />
                          
                          {/* Search button - Icon only, black */}
                          <button 
                            type="submit"
                            style={{
                              height: '42px',
                              backgroundColor: '#000000',
                              color: 'white',
                              border: 'none',
                              borderTopRightRadius: '0',
                              borderBottomRightRadius: '0',
                              padding: '0 16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: 0,
                              boxSizing: 'border-box'
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
                { name: 'Libertad y Desarrollo', color: '#000000', logo: '/logos/lyd_logo.png' },
                { name: 'Banco Central', color: '#003087', logo: '/logos/banco_central_logo.png' },
                { name: 'Universidad de Chile', color: '#0032A0', logo: '/logos/u_chile_logo.png' },
                { name: 'Cámara de Diputados', color: '#B22234', logo: '/logos/camara_diputados_logo.png' },
                { name: 'Pontificia Universidad Católica', color: '#8A1538', logo: '/logos/puc_logo.png' },
                { name: 'CEPAL', color: '#009EDB', logo: '/logos/cepal_logo.png' },
                { name: 'BID', color: '#F7A800', logo: '/logos/bid_logo.png' },
                { name: 'Ciper', color: '#E53935', logo: '/logos/ciper_logo.png' },
                { name: 'BCN', color: '#1565C0', logo: '/logos/bcn_logo.png' },
                { name: 'Senado', color: '#001489', logo: '/logos/senado_logo.png' },
                { name: 'CEP', color: '#652C8F', logo: '/logos/cep_logo.png' }
              ].map((logo, index) => (
                <div key={`logo-1-${index}`} style={{
                  width: '100px',
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
                        maxHeight: ['Banco Central', 'Cámara de Diputados', 'Ciper', 'BCN'].includes(logo.name) ? '85px' : '65px',
                        maxWidth: ['Banco Central', 'Cámara de Diputados', 'Ciper', 'BCN'].includes(logo.name) ? '95%' : '80%',
                        width: 'auto',
                        objectFit: 'contain',
                        filter: 'grayscale(100%)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      color: logo.color,
                      fontWeight: '600',
                      fontSize: '14px',
                      textAlign: 'center',
                      width: '100%',
                      padding: '0 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      {logo.name}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Duplicate set of logos to ensure smooth infinite scrolling */}
              {[
                { name: 'Libertad y Desarrollo', color: '#000000', logo: '/logos/lyd_logo.png' },
                { name: 'Banco Central', color: '#003087', logo: '/logos/banco_central_logo.png' },
                { name: 'Universidad de Chile', color: '#0032A0', logo: '/logos/u_chile_logo.png' },
                { name: 'Cámara de Diputados', color: '#B22234', logo: '/logos/camara_diputados_logo.png' },
                { name: 'Pontificia Universidad Católica', color: '#8A1538', logo: '/logos/puc_logo.png' },
                { name: 'CEPAL', color: '#009EDB', logo: '/logos/cepal_logo.png' },
                { name: 'BID', color: '#F7A800', logo: '/logos/bid_logo.png' },
                { name: 'Ciper', color: '#E53935', logo: '/logos/ciper_logo.png' },
                { name: 'BCN', color: '#1565C0', logo: '/logos/bcn_logo.png' },
                { name: 'Senado', color: '#001489', logo: '/logos/senado_logo.png' },
                { name: 'CEP', color: '#652C8F', logo: '/logos/cep_logo.png' }
              ].map((logo, index) => (
                <div key={`logo-2-${index}`} style={{
                  width: '100px',
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
                        maxHeight: ['Banco Central', 'Cámara de Diputados', 'Ciper', 'BCN'].includes(logo.name) ? '85px' : '65px',
                        maxWidth: ['Banco Central', 'Cámara de Diputados', 'Ciper', 'BCN'].includes(logo.name) ? '95%' : '80%',
                        width: 'auto',
                        objectFit: 'contain',
                        filter: 'grayscale(100%)'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      color: logo.color,
                      fontWeight: '600',
                      fontSize: '14px',
                      textAlign: 'center',
                      width: '100%',
                      padding: '0 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
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

          {/* Testimonials Section */}
          <section style={{
            padding: '60px 0',
            backgroundColor: 'white',
            position: 'relative'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px'
            }}>
              {/* Testimonials Container */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '40px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {/* Testimonial 1 */}
                <div style={{ 
                  width: 'calc(50% - 20px)',
                  minWidth: '300px',
                  position: 'relative',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '0',
                  border: '2px solid #000000',
                  boxSizing: 'border-box'
                }}>
                  {/* Pink line at the top of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '2px',
                    width: 'calc(100% - 0px)',
                    height: '2px',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>
                  
                  {/* Pink line at the right side of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '2px',
                    height: 'calc(100% + 4px)',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>

                  {/* Testimonial Content */}
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Person Image */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '40px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src="/testimonial/testimonial_1.png" 
                        alt="Profesor Universidad de Chile" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'grayscale(100%)'
                        }}
                      />
                    </div>

                    {/* Testimonial Text */}
                    <div>
                      <p style={{
                        fontStyle: 'italic',
                        marginBottom: '12px',
                        fontSize: '16px',
                        lineHeight: '1.5'
                      }}>
                        "Agora ha revolucionado la forma en que mis estudiantes investigan sobre política chilena. La precisión de las respuestas y la facilidad de uso hacen que la información sea accesible para todos."
                      </p>
                      <p style={{
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        Carlos Rodríguez
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        Profesor de Ciencias Políticas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div style={{ 
                  width: 'calc(50% - 20px)',
                  minWidth: '300px',
                  position: 'relative',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: '0',
                  border: '2px solid #000000',
                  boxSizing: 'border-box'
                }}>
                  {/* Pink line at the top of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '2px',
                    width: 'calc(100% - 0px)',
                    height: '2px',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>
                  
                  {/* Pink line at the right side of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '2px',
                    height: 'calc(100% + 4px)',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>

                  {/* Testimonial Content */}
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Person Image */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '40px',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src="/testimonial/testimonial_2.jpg" 
                        alt="Periodista" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'grayscale(100%)'
                        }}
                      />
                    </div>

                    {/* Testimonial Text */}
                    <div>
                      <p style={{
                        fontStyle: 'italic',
                        marginBottom: '12px',
                        fontSize: '16px',
                        lineHeight: '1.5'
                      }}>
                        "Como periodista, Agora me permite verificar datos económicos y políticos rápidamente. Las fuentes están claramente citadas, lo que facilita mi trabajo de investigación y redacción."
                      </p>
                      <p style={{
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        Marta Jiménez
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        Periodista Investigadora
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                }}>Conocimiento político, legislativo y económico al alcance de todos</h2>
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
                    width: '100%',
                    minWidth: '300px',
                    position: 'relative',
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '0',
                    border: '2px solid #000000',
                    boxSizing: 'border-box',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'; // Small lift effect
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Pink line at the top of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '2px',
                    width: 'calc(100% - 0px)',
                    height: '2px',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>
                  
                  {/* Pink line at the right side of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '2px',
                    height: 'calc(100% + 4px)',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>

                  {/* Icon */}
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '0',
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L16.65 16.65" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>Datos Completos</h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    textAlign: 'center'
                  }}>Accede a una extensa base de datos sobre política, economía y legislación chilena actualizada constantemente.</p>
                </div>
                
                {/* Card 2: PDF Processing */}
                <div 
                  style={{
                    width: '100%',
                    minWidth: '300px',
                    position: 'relative',
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '0',
                    border: '2px solid #000000',
                    boxSizing: 'border-box',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'; // Small lift effect
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Pink line at the top of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '2px',
                    width: 'calc(100% - 0px)',
                    height: '2px',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>
                  
                  {/* Pink line at the right side of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '2px',
                    height: 'calc(100% + 4px)',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>

                  {/* Icon */}
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '0',
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H9H8" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>Análisis Profundo</h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    textAlign: 'center'
                  }}>Obtén análisis detallados que te ayudarán a comprender mejor la realidad política y económica de Chile.</p>
                </div>
                
                {/* Card 3: AI-Powered Analysis */}
                <div 
                  style={{
                    width: '100%',
                    minWidth: '300px',
                    position: 'relative',
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '0',
                    border: '2px solid #000000',
                    boxSizing: 'border-box',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'; // Small lift effect
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Pink line at the top of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '2px',
                    width: 'calc(100% - 0px)',
                    height: '2px',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>
                  
                  {/* Pink line at the right side of the container */}
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '2px',
                    height: 'calc(100% + 4px)',
                    backgroundColor: '#ec4899',
                    zIndex: 1
                  }}></div>

                  {/* Icon */}
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '0',
                    backgroundColor: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H22" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>Acceso Universal</h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    textAlign: 'center'
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* Logo on the left side of footer */}
              <div style={{ width: '150px' }}>
                <img 
                  src="/logo.png" 
                  alt="Agora Logo" 
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Navigation links on the right side */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'flex-start' 
              }}>
                <a href="#" style={{ 
                  color: '#000000', 
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '16px'
                }}>
                  Producto
                </a>
                <a href="#" style={{ 
                  color: '#000000', 
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '16px'
                }}>
                  Precios
                </a>
                <a href="#" style={{ 
                  color: '#000000', 
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '16px'
                }}>
                  Contacto
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}