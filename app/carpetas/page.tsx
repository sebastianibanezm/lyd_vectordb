"use client";

import { useState, useEffect } from 'react';
import { Folder, File, Plus, Edit, Trash, Search, ArrowLeft, SquarePen, Bookmark, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types for our data structure
interface Question {
  id: string;
  title: string;
  originalQuestion: string;
  timestamp: number;
  answer?: string;
  sources?: Array<{title: string, url: string}>;
}

interface Carpeta {
  id: string;
  name: string;
  timestamp: number;
  questions: Question[];
}

// Define styles for sidebar to match chat page
const styles = {
  sidebar: {
    width: '280px',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: 'white'
  },
  sidebarNav: {
    padding: '12px 16px'
  },
  navButton: {
    width: '100%',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    color: '#475569',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    marginBottom: '4px',
    textDecoration: 'none', // For links
    fontFamily: 'inherit', // Ensure consistent font
    fontSize: 'inherit'
  },
  activeNavButton: {
    backgroundColor: '#f1f5f9',
    color: '#3b82f6',
    fontWeight: 500
  },
  historySection: {
    marginTop: '16px',
    padding: '0 16px'
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0
  },
  historySubtitle: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#64748b'
  }
};

export default function CarpetasPage() {
  const router = useRouter();
  const [carpetas, setCarpetas] = useState<Carpeta[]>([]);
  const [selectedCarpeta, setSelectedCarpeta] = useState<Carpeta | null>(null);
  const [isCreatingCarpeta, setIsCreatingCarpeta] = useState(false);
  const [newCarpetaName, setNewCarpetaName] = useState('');
  const [isEditingCarpeta, setIsEditingCarpeta] = useState(false);
  const [editingCarpetaId, setEditingCarpetaId] = useState<string | null>(null);
  const [editingCarpetaName, setEditingCarpetaName] = useState('');
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionTitle, setEditingQuestionTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [bibliographySources, setBibliographySources] = useState<Array<{title: string, url: string, type: 'article' | 'document'}>>([]);
  const [historyItems, setHistoryItems] = useState<Array<{
    id: string, 
    title: string, 
    timestamp: number, 
    question: string,
    answer: string,
    sources?: Array<{title: string, url: string}>
  }>>([]);
  
  // Load carpetas from localStorage on component mount
  useEffect(() => {
    try {
      const savedCarpetas = localStorage.getItem('carpetas');
      if (savedCarpetas) {
        setCarpetas(JSON.parse(savedCarpetas));
      }
    } catch (error) {
      console.error('Error loading carpetas from localStorage:', error);
    }
  }, []);
  
  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistoryItems(parsed);
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
    }
  }, []);
  
  // Load bibliography sources from localStorage on component mount
  useEffect(() => {
    try {
      const savedBibliography = localStorage.getItem(`bibliography_${selectedCarpeta?.id}`);
      if (savedBibliography) {
        setBibliographySources(JSON.parse(savedBibliography));
      } else {
        setBibliographySources([]);
      }
    } catch (error) {
      console.error('Error loading bibliography from localStorage:', error);
      setBibliographySources([]);
    }
  }, [selectedCarpeta?.id]);
  
  // Save bibliography sources to localStorage when they change
  useEffect(() => {
    if (selectedCarpeta?.id && bibliographySources.length >= 0) {
      try {
        localStorage.setItem(`bibliography_${selectedCarpeta.id}`, JSON.stringify(bibliographySources));
      } catch (error) {
        console.error('Error saving bibliography to localStorage:', error);
      }
    }
  }, [bibliographySources, selectedCarpeta?.id]);
  
  // Navigate to chat page
  const goToChat = () => {
    router.push('/chat');
  };
  
  // Function to clear all history
  const clearHistory = () => {
    localStorage.removeItem('chatHistory');
    setHistoryItems([]);
  };
  
  // Function to load a question from history
  const loadQuestionFromHistory = (historyItem: {
    question?: string,
    title?: string,
    answer?: string,
    sources?: Array<{title: string, url: string}>
  }) => {
    // Create a stored question key for this history item
    const storedQuestionKey = `stored_question_${Date.now()}`;
    localStorage.setItem(storedQuestionKey, JSON.stringify({
      question: historyItem.question || historyItem.title || '',
      answer: historyItem.answer || '',
      sources: historyItem.sources || [],
      timestamp: Date.now()
    }));
    
    // Navigate to chat page with the storage key as a parameter
    router.push(`/chat?stored=${storedQuestionKey}`);
  };
  
  // Save carpetas to localStorage when they change
  useEffect(() => {
    try {
      if (carpetas.length > 0) {
        localStorage.setItem('carpetas', JSON.stringify(carpetas));
      }
    } catch (error) {
      console.error('Error saving carpetas to localStorage:', error);
    }
  }, [carpetas]);
  
  // Handle creating a new carpeta
  const handleCreateCarpeta = () => {
    if (!newCarpetaName.trim()) return;
    
    const newCarpeta: Carpeta = {
      id: Date.now().toString(),
      name: newCarpetaName.trim(),
      timestamp: Date.now(),
      questions: []
    };
    
    setCarpetas(prev => [...prev, newCarpeta]);
    setNewCarpetaName('');
    setIsCreatingCarpeta(false);
  };
  
  // Handle editing a carpeta name
  const handleEditCarpeta = (carpeta: Carpeta) => {
    setIsEditingCarpeta(true);
    setEditingCarpetaId(carpeta.id);
    setEditingCarpetaName(carpeta.name);
  };
  
  // Save edited carpeta name
  const saveEditedCarpeta = () => {
    if (!editingCarpetaName.trim() || !editingCarpetaId) return;
    
    setCarpetas(prev => prev.map(carpeta => 
      carpeta.id === editingCarpetaId 
        ? { ...carpeta, name: editingCarpetaName.trim() } 
        : carpeta
    ));
    
    setIsEditingCarpeta(false);
    setEditingCarpetaId(null);
    setEditingCarpetaName('');
    
    // If we're editing the currently selected carpeta, update its name in the state
    if (selectedCarpeta && selectedCarpeta.id === editingCarpetaId) {
      setSelectedCarpeta(prev => prev ? { ...prev, name: editingCarpetaName.trim() } : null);
    }
  };
  
  // Handle deleting a carpeta
  const handleDeleteCarpeta = (carpetaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta carpeta y todas sus preguntas guardadas?')) {
      setCarpetas(prev => prev.filter(carpeta => carpeta.id !== carpetaId));
      
      // If we're deleting the currently selected carpeta, clear it
      if (selectedCarpeta && selectedCarpeta.id === carpetaId) {
        setSelectedCarpeta(null);
      }
    }
  };
  
  // Handle selecting a carpeta to view its questions
  const handleSelectCarpeta = (carpeta: Carpeta) => {
    setSelectedCarpeta(carpeta);
  };
  
  // Handle going back to the carpetas list
  const handleBackToCarpetas = () => {
    setSelectedCarpeta(null);
  };
  
  // Handle editing a question title
  const handleEditQuestion = (question: Question) => {
    setIsEditingQuestion(true);
    setEditingQuestionId(question.id);
    setEditingQuestionTitle(question.title);
  };
  
  // Save edited question title
  const saveEditedQuestion = () => {
    if (!editingQuestionTitle.trim() || !editingQuestionId || !selectedCarpeta) return;
    
    const updatedQuestions = selectedCarpeta.questions.map(question => 
      question.id === editingQuestionId 
        ? { ...question, title: editingQuestionTitle.trim() } 
        : question
    );
    
    setSelectedCarpeta({ ...selectedCarpeta, questions: updatedQuestions });
    
    setCarpetas(prev => prev.map(carpeta => 
      carpeta.id === selectedCarpeta.id 
        ? { ...carpeta, questions: updatedQuestions } 
        : carpeta
    ));
    
    setIsEditingQuestion(false);
    setEditingQuestionId(null);
    setEditingQuestionTitle('');
  };
  
  // Handle deleting a question
  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedCarpeta) return;
    
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta guardada?')) {
      const updatedQuestions = selectedCarpeta.questions.filter(
        question => question.id !== questionId
      );
      
      setSelectedCarpeta({ ...selectedCarpeta, questions: updatedQuestions });
      
      setCarpetas(prev => prev.map(carpeta => 
        carpeta.id === selectedCarpeta.id 
          ? { ...carpeta, questions: updatedQuestions } 
          : carpeta
      ));
    }
  };
  
  // Handle navigating to a question
  const handleOpenQuestion = (question: Question) => {
    if (question.originalQuestion) {
      // Store the complete question data in localStorage with a unique key
      const storedQuestionKey = `stored_question_${Date.now()}`;
      localStorage.setItem(storedQuestionKey, JSON.stringify({
        question: question.originalQuestion,
        answer: question.answer || '',
        sources: question.sources || [],
        timestamp: question.timestamp
      }));
      
      // Navigate to chat page with the storage key as a parameter
      router.push(`/chat?stored=${storedQuestionKey}`);
    }
  };
  
  // Filter carpetas by search query
  const filteredCarpetas = searchQuery 
    ? carpetas.filter(carpeta => 
        carpeta.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : carpetas;
  
  // Filter questions by search query if a carpeta is selected
  const filteredQuestions = selectedCarpeta && searchQuery 
    ? selectedCarpeta.questions.filter(question => 
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.originalQuestion.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCarpeta?.questions || [];
  
  // Sort carpetas by most recent first
  const sortedCarpetas = [...filteredCarpetas].sort((a, b) => b.timestamp - a.timestamp);
  
  // Sort questions by most recent first
  const sortedQuestions = [...filteredQuestions].sort((a, b) => b.timestamp - a.timestamp);
  
  // Toggle the expanded state of sources for a specific question
  const toggleSourcesExpanded = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // If this question's sources are already expanded, collapse them
    // Otherwise, collapse all other expanded sources and expand this one
    setExpandedSources(prev => {
      const wasExpanded = prev[questionId];
      
      // If we're clicking on an already expanded item, just close it
      if (wasExpanded) {
        return {
          ...prev,
          [questionId]: false
        };
      }
      
      // Otherwise, close all others and open this one
      return {
        // Start with an empty object (all closed)
        [questionId]: true // Only open the clicked one
      };
    });
  };
  
  // Helper function to check if a URL is a PDF (same as in chat app)
  const isPdfUrl = (url: string): boolean => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf')) return true;
    
    // Check if URL contains common PDF viewer paths
    const pdfViewers = [
      'viewerng/viewer.html',
      'web/viewer.html',
      'pdfjs/web/viewer.html',
      'pdf-viewer',
    ];
    
    return pdfViewers.some(viewer => lowerUrl.includes(viewer));
  };
  
  // Add a source to the bibliography
  const addToBibliography = (source: {title: string, url: string}, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if source already exists in bibliography
    const sourceExists = bibliographySources.some(item => item.url === source.url);
    
    if (!sourceExists) {
      const type = isPdfUrl(source.url) ? 'document' : 'article';
      setBibliographySources(prev => [...prev, {...source, type}]);
    }
  };
  
  // Remove a source from the bibliography
  const removeFromBibliography = (url: string) => {
    setBibliographySources(prev => prev.filter(source => source.url !== url));
  };
  
  return (
    <>
      {/* Header */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '62px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
          borderRadius: '0',
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
                width: '60px', 
                height: '60px',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Right side with links and button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
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
                height: '2px',  /* Increase height from 2px to 3px */
                backgroundColor: '#ec4899',
                zIndex: 1
              }}></div>
              
              {/* Pink line at the right side of the button */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '2px',  /* Increase width from 2px to 3px */
                height: 'calc(100% + 4px)',
                backgroundColor: '#ec4899',
                zIndex: 1
              }}></div>
              
              Registrate
            </button>
          </div>
        </div>
      </div>

      {/* Main container with sidebar and content - adjust for header height */}
      <div style={{
        display: 'flex',
        marginTop: '62px',
        height: 'calc(100vh - 62px)',
        width: '100%',
        backgroundColor: 'white',
        overflow: 'hidden'
      }}>
        {/* Left sidebar - same as in chat page */}
        <div style={styles.sidebar}>
          <div style={{
            ...styles.sidebarNav,
            marginTop: '16px'
          }}>
            <Link href="/chat" style={styles.navButton}>
              <SquarePen size={18} />
              <span>Nueva Pregunta</span>
            </Link>
            
            <Link 
              href="/carpetas" 
              style={{
                ...styles.navButton,
                backgroundColor: '#f1f5f9',
                color: '#3b82f6',
                fontWeight: 500
              }}
            >
              <Folder size={18} />
              <span>Carpetas</span>
            </Link>
          </div>
          
          <div style={styles.historySection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={styles.historyTitle}>Historial</h3>
              {historyItems.length > 0 && (
                <button 
                  onClick={clearHistory}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            
            {historyItems.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto',
                paddingRight: '8px'
              }}>
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      overflow: 'hidden'
                    }}
                    onClick={() => {
                      loadQuestionFromHistory(item);
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    <MessageSquare size={16} style={{ marginRight: '8px', color: '#64748b' }} />
                    <div style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '14px',
                      color: '#334155'
                    }}>
                      {item.title || item.question}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                marginTop: '12px',
                fontStyle: 'italic'
              }}>
                No history items yet.
              </p>
            )}
          </div>
        </div>

        {/* Main content area - adjusted for sidebar and potentially bibliography */}
        <div style={{
          flex: 1,
          padding: '24px',
          minHeight: 'calc(100vh - 62px)',
          backgroundColor: '#f9fafb',
          overflowY: 'auto',
          display: 'flex',
        }}>
          {/* Questions or Carpetas View */}
          <div style={{
            flex: 1,
            marginRight: selectedCarpeta ? '24px' : '0'
          }}>
            {/* Page header with title and search */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {selectedCarpeta && (
                  <button
                    onClick={handleBackToCarpetas}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={24} color="#4b5563" />
                  </button>
                )}
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0
                }}>
                  {selectedCarpeta ? selectedCarpeta.name : 'Carpetas'}
                </h1>
              </div>
              
              {/* Search box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                gap: '8px',
                maxWidth: '300px',
                width: '100%'
              }}>
                <Search size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder={selectedCarpeta ? "Buscar preguntas..." : "Buscar carpetas..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    width: '100%',
                    fontSize: '14px',
                    color: '#1e293b'
                  }}
                />
              </div>
            </div>
            
            {!selectedCarpeta ? (
              /* Carpetas view */
              <>
                {/* Create new carpeta button */}
                <div style={{
                  marginBottom: '24px'
                }}>
                  {!isCreatingCarpeta ? (
                    <button
                      onClick={() => setIsCreatingCarpeta(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#f1f5f9',
                        border: '1px dashed #94a3b8',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#475569',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        width: '100%',
                        maxWidth: '300px',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={18} />
                      <span>Nueva Carpeta</span>
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      maxWidth: '400px'
                    }}>
                      <input
                        type="text"
                        placeholder="Nombre de la carpeta"
                        value={newCarpetaName}
                        onChange={(e) => setNewCarpetaName(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          fontSize: '15px',
                          color: '#1e293b',
                          outline: 'none'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCarpeta()}
                      />
                      <button
                        onClick={handleCreateCarpeta}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '6px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Crear
                      </button>
                      <button
                        onClick={() => setIsCreatingCarpeta(false)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: '1px solid #e5e7eb',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Carpetas grid */}
                {carpetas.length === 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginTop: '48px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto'
                    }}>
                      <Folder size={32} color="#64748b" />
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>No hay carpetas</h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '15px',
                      maxWidth: '400px',
                      margin: '0 auto'
                    }}>
                      Crea tu primera carpeta para empezar a organizar tus preguntas guardadas
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                  }}>
                    {sortedCarpetas.map(carpeta => (
                      <div
                        key={carpeta.id}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e5e7eb',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        {/* Main section, clickable to open carpeta */}
                        <div 
                          style={{
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}
                          onClick={() => handleSelectCarpeta(carpeta)}
                        >
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Folder size={24} color="#3b82f6" />
                          </div>
                          
                          <div>
                            {isEditingCarpeta && editingCarpetaId === carpeta.id ? (
                              <input
                                type="text"
                                value={editingCarpetaName}
                                onChange={(e) => setEditingCarpetaName(e.target.value)}
                                autoFocus
                                style={{
                                  fontSize: '17px',
                                  fontWeight: 600,
                                  color: '#1e293b',
                                  width: '100%',
                                  padding: '6px 8px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '4px',
                                  outline: 'none'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && saveEditedCarpeta()}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <h3 style={{
                                fontSize: '17px',
                                fontWeight: 600,
                                color: '#1e293b',
                                margin: '0 0 4px 0'
                              }}>
                                {carpeta.name}
                              </h3>
                            )}
                            <p style={{
                              color: '#64748b',
                              fontSize: '14px',
                              margin: 0
                            }}>
                              {carpeta.questions.length} {carpeta.questions.length === 1 ? 'pregunta' : 'preguntas'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Footer with actions */}
                        <div style={{
                          padding: '12px 20px',
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                          <span style={{
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            {new Date(carpeta.timestamp).toLocaleDateString()}
                          </span>
                          
                          <div style={{
                            display: 'flex',
                            gap: '8px'
                          }}>
                            {isEditingCarpeta && editingCarpetaId === carpeta.id ? (
                              <>
                                <button
                                  onClick={saveEditedCarpeta}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#34d399',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingCarpeta(false);
                                    setEditingCarpetaId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#f43f5e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCarpeta(carpeta);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#4b5563',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCarpeta(carpeta.id);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#4b5563',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Questions view for selected carpeta */
              <>
                {/* Empty state for no questions */}
                {sortedQuestions.length === 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    marginTop: '48px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto'
                    }}>
                      <File size={32} color="#64748b" />
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>No hay preguntas guardadas</h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '15px',
                      maxWidth: '400px',
                      margin: '0 auto 16px'
                    }}>
                      Guarda preguntas en esta carpeta durante tus investigaciones
                    </p>
                    <Link href="/chat" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '15px',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}>
                      <Plus size={18} />
                      <span>Realizar una pregunta</span>
                    </Link>
                  </div>
                ) : (
                  /* Questions grid */
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {sortedQuestions.map(question => (
                      <div
                        key={question.id}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          border: '1px solid #e5e7eb',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        {/* Card content */}
                        <div 
                          style={{
                            padding: '20px',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px'
                          }}
                          onClick={() => handleOpenQuestion(question)}
                        >
                          <div>
                            {/* Date at the top of the card */}
                            <span style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              display: 'block',
                              marginBottom: '8px'
                            }}>
                              {new Date(question.timestamp).toLocaleDateString()}
                            </span>
                            
                            {isEditingQuestion && editingQuestionId === question.id ? (
                              <input
                                type="text"
                                value={editingQuestionTitle}
                                onChange={(e) => setEditingQuestionTitle(e.target.value)}
                                autoFocus
                                style={{
                                  fontSize: '17px',
                                  fontWeight: 600,
                                  color: '#1e293b',
                                  width: '100%',
                                  padding: '6px 8px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '4px',
                                  outline: 'none'
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && saveEditedQuestion()}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <h3 style={{
                                fontSize: '17px',
                                fontWeight: 600,
                                color: '#1e293b',
                                margin: '0 0 12px 0',
                                lineHeight: 1.4
                              }}>
                                {question.title}
                              </h3>
                            )}
                            
                            <p style={{
                              color: '#64748b',
                              fontSize: '14px',
                              lineHeight: 1.5,
                              margin: 0,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              textOverflow: 'ellipsis'
                            }}>
                              {question.originalQuestion}
                            </p>
                          </div>
                        </div>
                        
                        {/* Card footer */}
                        <div style={{
                          padding: '12px 20px',
                          borderTop: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {/* Fuentes toggle button */}
                            {question.sources && question.sources.length > 0 && (
                              <button
                                onClick={(e) => toggleSourcesExpanded(question.id, e)}
                                style={{
                                  fontSize: '13px',
                                  color: '#3b82f6',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: expandedSources[question.id] ? 600 : 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>Fuentes ({question.sources.length})</span>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  style={{
                                    transition: 'transform 0.2s',
                                    transform: expandedSources[question.id] ? 'rotate(180deg)' : 'rotate(0)'
                                  }}
                                >
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            gap: '8px'
                          }}>
                            {isEditingQuestion && editingQuestionId === question.id ? (
                              <>
                                <button
                                  onClick={saveEditedQuestion}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#34d399',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditingQuestion(false);
                                    setEditingQuestionId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#f43f5e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditQuestion(question);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#4b5563',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteQuestion(question.id);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#4b5563',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Expandable Sources Section */}
                        {expandedSources[question.id] && question.sources && question.sources.length > 0 && (
                          <div 
                            style={{
                              padding: '0 20px 20px 20px',
                              borderTop: '1px solid #e5e7eb',
                              backgroundColor: '#f9fafb',
                              overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Split sources into articles and documents */}
                            {(() => {
                              const articles = question.sources.filter(source => !isPdfUrl(source.url));
                              const documents = question.sources.filter(source => isPdfUrl(source.url));
                              
                              return (
                                <div style={{
                                  marginTop: '12px'
                                }}>
                                  {/* Articles */}
                                  {articles.length > 0 && (
                                    <div style={{marginBottom: '16px'}}>
                                      <h4 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '0 0 12px 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        borderBottom: '2px solid #3b82f6',
                                        paddingBottom: '6px'
                                      }}>
                                        <div style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          backgroundColor: '#3b82f6',
                                          marginRight: '8px'
                                        }}></div>
                                        <span>Artículos</span>
                                      </h4>
                                      
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                      }}>
                                        {articles.map((source, index) => (
                                          <div 
                                            key={`article-${index}`}
                                            style={{
                                              position: 'relative',
                                              textDecoration: 'none',
                                              color: 'inherit',
                                              display: 'block',
                                              backgroundColor: 'white',
                                              border: '1px solid #e5e7eb',
                                              borderRadius: '6px',
                                              padding: '10px 12px',
                                              fontSize: '13px',
                                              lineHeight: '1.4',
                                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                            }}
                                          >
                                            <div style={{
                                              fontWeight: 600,
                                              marginBottom: '4px',
                                              color: '#1e293b'
                                            }}>
                                              {source.title}
                                            </div>
                                            <div style={{
                                              color: '#3b82f6',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              fontSize: '12px'
                                            }}>
                                              <a 
                                                href={source.url} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'inherit', textDecoration: 'none' }}
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                {source.url}
                                              </a>
                                            </div>
                                            <button
                                              onClick={(e) => addToBibliography(source, e)}
                                              style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: '#3b82f6',
                                                border: 'none',
                                                borderRadius: '4px',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                cursor: 'pointer'
                                              }}
                                              title="Añadir a bibliografía"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                              </svg>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Documents */}
                                  {documents.length > 0 && (
                                    <div>
                                      <h4 style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '0 0 12px 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#1e293b',
                                        borderBottom: '2px solid #ef4444',
                                        paddingBottom: '6px'
                                      }}>
                                        <div style={{
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '50%',
                                          backgroundColor: '#ef4444',
                                          marginRight: '8px'
                                        }}></div>
                                        <span>Documentos</span>
                                      </h4>
                                      
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                      }}>
                                        {documents.map((source, index) => (
                                          <div 
                                            key={`document-${index}`}
                                            style={{
                                              position: 'relative',
                                              textDecoration: 'none',
                                              color: 'inherit',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '10px',
                                              backgroundColor: 'white',
                                              border: '1px solid #e5e7eb',
                                              borderRadius: '6px',
                                              padding: '10px 12px',
                                              fontSize: '13px',
                                              lineHeight: '1.4',
                                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                            }}
                                          >
                                            <div style={{
                                              width: '28px',
                                              height: '28px',
                                              backgroundColor: '#fee2e2',
                                              borderRadius: '6px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: '#ef4444',
                                              flexShrink: 0
                                            }}>
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                              </svg>
                                            </div>
                                            <div style={{
                                              overflow: 'hidden'
                                            }}>
                                              <div style={{
                                                fontWeight: 600,
                                                marginBottom: '4px',
                                                color: '#1e293b',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                              }}>
                                                {source.title}
                                              </div>
                                              <div style={{
                                                color: '#3b82f6',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: '12px'
                                              }}>
                                                <a 
                                                  href={source.url} 
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  {source.url}
                                                </a>
                                              </div>
                                            </div>
                                            <button
                                              onClick={(e) => addToBibliography(source, e)}
                                              style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: '#ef4444',
                                                border: 'none',
                                                borderRadius: '4px',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                cursor: 'pointer'
                                              }}
                                              title="Añadir a bibliografía"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                              </svg>
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* No sources */}
                                  {articles.length === 0 && documents.length === 0 && (
                                    <div style={{
                                      textAlign: 'center',
                                      color: '#6b7280',
                                      padding: '20px',
                                      fontSize: '14px',
                                      fontStyle: 'italic'
                                    }}>
                                      No hay fuentes disponibles
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Bibliography Section - only show when a carpeta is selected */}
          {selectedCarpeta && (
            <div style={{
              width: '320px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '20px',
              height: 'fit-content',
              position: 'sticky',
              top: '24px',
              maxHeight: 'calc(100vh - 110px)',
              overflowY: 'auto'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1e293b',
                marginTop: 0,
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Bibliografía
              </h2>
              
              {bibliographySources.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#64748b',
                  padding: '20px 0',
                  fontSize: '14px'
                }}>
                  <p style={{ marginBottom: '12px' }}>
                    No hay fuentes en la bibliografía
                  </p>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Haz clic en "+" junto a las fuentes para añadirlas
                  </p>
                </div>
              ) : (
                <div>
                  {/* Articles */}
                  {bibliographySources.filter(source => source.type === 'article').length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1e293b',
                        borderBottom: '2px solid #3b82f6',
                        paddingBottom: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          marginRight: '8px'
                        }}></div>
                        <span>Artículos</span>
                      </h4>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {bibliographySources
                          .filter(source => source.type === 'article')
                          .map((source, index) => (
                            <div 
                              key={`bib-article-${index}`}
                              style={{
                                position: 'relative',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '13px',
                                lineHeight: '1.4',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                              }}
                            >
                              <div style={{
                                fontWeight: 600,
                                marginBottom: '4px',
                                color: '#1e293b',
                                paddingRight: '24px' // Space for delete button
                              }}>
                                {source.title}
                              </div>
                              <div style={{
                                color: '#3b82f6',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '12px'
                              }}>
                                <a 
                                  href={source.url} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'inherit', textDecoration: 'none' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {source.url}
                                </a>
                              </div>
                              <button
                                onClick={() => removeFromBibliography(source.url)}
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  backgroundColor: '#3b82f6',
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                                title="Eliminar de bibliografía"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Documents */}
                  {bibliographySources.filter(source => source.type === 'document').length > 0 && (
                    <div>
                      <h4 style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1e293b',
                        borderBottom: '2px solid #ef4444',
                        paddingBottom: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          marginRight: '8px'
                        }}></div>
                        <span>Documentos</span>
                      </h4>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {bibliographySources
                          .filter(source => source.type === 'document')
                          .map((source, index) => (
                            <div 
                              key={`bib-document-${index}`}
                              style={{
                                position: 'relative',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '10px 12px',
                                fontSize: '13px',
                                lineHeight: '1.4',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}
                            >
                              <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#fee2e2',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444',
                                flexShrink: 0
                              }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                  <line x1="16" y1="13" x2="8" y2="13"></line>
                                  <line x1="16" y1="17" x2="8" y2="17"></line>
                                  <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                              </div>
                              <div style={{
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  fontWeight: 600,
                                  marginBottom: '4px',
                                  color: '#1e293b',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {source.title}
                                </div>
                                <div style={{
                                  color: '#3b82f6',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: '12px'
                                }}>
                                  <a 
                                    href={source.url} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {source.url}
                                  </a>
                                </div>
                              </div>
                              <button
                                onClick={(e) => removeFromBibliography(source.url)}
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  backgroundColor: '#ef4444',
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                                title="Eliminar de bibliografía"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 