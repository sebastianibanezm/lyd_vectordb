"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, SquarePen, Bookmark, RefreshCcw, X } from 'lucide-react';
import { useCompletion } from "@ai-sdk/react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import SourceCard from '@/components/SourceCard';
import DocumentItem from '@/components/DocumentItem';
import chatStyles from './ChatPage.module.css';

// Define styles to ensure they're applied
const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    width: '100%',
    backgroundColor: 'white',
    overflow: 'hidden'
  },
  sidebar: {
    width: '280px',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    height: '32px',
    width: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 600
  },
  brandName: {
    marginLeft: '8px',
    fontWeight: 600,
    color: '#1e293b'
  },
  closeButton: {
    marginLeft: 'auto',
    height: '32px',
    width: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    background: 'transparent'
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
    marginBottom: '4px'
  },
  historySection: {
    marginTop: '16px',
    padding: '0 16px'
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b'
  },
  historySubtitle: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#64748b'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    height: '100%',
    overflow: 'hidden',
    backgroundImage: 'url(/santiago.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },
  contentOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.65)', // Increased transparency from 0.85 to 0.65
    zIndex: 1
  },
  contentContainer: {
    maxWidth: '100%',
    width: '100%',
    margin: '0 auto',
    padding: '0 0 0 24px',
    position: 'relative' as const,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100% - 62px)', // Adjusted from 54px to 62px to account for taller input area
    overflow: 'hidden'
  },
  contentFlexContainer: {
    // Styles are now applied directly to the element
  },
  mainContentArea: {
    flex: 1,
    minWidth: 0 // Prevent flex items from overflowing
  },
  sourcesContainer: {
    position: 'sticky' as const,
    top: '24px',
    width: '100%',
    maxHeight: '500px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '8px 0'
  },
  sourcesHeader: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#4b5563',
    marginBottom: '8px'
  },
  sourceCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    lineHeight: '1.4',
    wordBreak: 'break-word' as const
  },
  sourceTitle: {
    fontWeight: 600,
    marginBottom: '4px',
    color: '#4b5563',
    fontSize: '13px'
  },
  sourceUrl: {
    color: '#3b82f6',
    textDecoration: 'none',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const
  },
  textarea: {
    flex: 1,
    height: '38px',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0 42px 0 12px',
    resize: 'none' as const,
    fontSize: '15px',
    outline: 'none',
    lineHeight: '38px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 13,
    color: '#000000'
  },
  sendButton: {
    position: 'absolute' as const,
    right: '3px',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '32px',
    width: '32px',
    minWidth: '32px',
    borderRadius: '6px',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '0',
    zIndex: 14
  },
  loadingDots: {
    display: 'flex',
    alignItems: 'center'
  },
  dot: {
    height: '8px',
    width: '8px',
    backgroundColor: '#94a3b8',
    borderRadius: '50%',
    margin: '0 2px',
    animation: 'bounce 1.4s infinite ease-in-out both'
  },
  heading: {
    fontSize: '28px',
    fontWeight: 600,
    textAlign: 'center' as const,
    color: '#1e293b',
    marginBottom: '48px'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer'
  },
  cardImage: {
    height: '160px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  cardTitle: {
    padding: '16px',
    fontWeight: 500,
    color: '#1e293b'
  },
  refreshButton: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '24px'
  },
  roundButton: {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#475569'
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    width: '100%',
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '15px',
    margin: '4px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '38px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
    width: 'fit-content',
    wordBreak: 'break-word' as const
  },
  botMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '15px',
    margin: '4px 0',
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: '38px',
    width: 'fit-content',
    overflow: 'auto',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-word' as const
  },
  inputContainer: {
    position: 'fixed' as const,
    bottom: 0,
    left: '280px',
    right: 0,
    borderTop: '1px solid #e5e7eb',
    backgroundColor: 'white',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 100,
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
  },
  inputForm: {
    maxWidth: 'calc(100% - 48px)',
    width: '100%',
    position: 'relative' as const,
    zIndex: 11,
    margin: '0 auto',
    padding: '0'
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    height: '38px',
    padding: '0',
    minWidth: '300px',
    zIndex: 12
  }
};

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [bubbleMaxHeight, setBubbleMaxHeight] = useState('600px');
  const [loadingText, setLoadingText] = useState('Analizando la pregunta');
  
  // Loading text rotation
  useEffect(() => {
    if (!isLoading) return;
    
    const loadingTexts = [
      'Analizando la pregunta',
      'Revisando las fuentes',
      'Realizando un analisis profundo',
      'Estableciendo criterios imparciales',
      'Generando una respuesta bien fundamentada'
    ];
    
    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 4000); // Changed from 1000 (1 second) to 4000 (4 seconds)
    
    // Reset to first message when loading begins
    setLoadingText(loadingTexts[0]);
    
    return () => clearInterval(intervalId);
  }, [isLoading]);
  
  // Calculate bubble max height based on viewport height
  useEffect(() => {
    const calculateHeight = () => {
      // Set bubble height to approximately 70% of the available viewport height
      const viewportHeight = window.innerHeight;
      const newHeight = Math.floor(viewportHeight * 0.7);
      setBubbleMaxHeight(`${newHeight}px`);
    };
    
    // Calculate initially
    calculateHeight();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);
    
    // Clean up
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);
  
  const [sources, setSources] = useState<Array<{title: string, url: string}>>([]);
  const [showButtons, setShowButtons] = useState(false); // State to control showing buttons or input
  const [historyItems, setHistoryItems] = useState<Array<{
    id: string, 
    title: string, 
    timestamp: number, 
    question: string,
    answer: string,
    sources: Array<{title: string, url: string}>
  }>>([]);
  
  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        
        // Check if we need to migrate old format history items
        const migratedHistory = parsed.map((item: any) => {
          // If the item doesn't have answer or sources, add placeholder values
          if (!item.answer || !item.sources) {
            return {
              ...item,
              answer: item.answer || '', 
              sources: item.sources || []
            };
          }
          return item;
        });
        
        setHistoryItems(migratedHistory);
      }
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
    }
  }, []);
  
  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      console.log('Saving history items:', historyItems.length);
      if (historyItems.length > 0) {
        // Debug the first item to ensure it has the correct data
        const firstItem = historyItems[0];
        console.log('First history item:', {
          title: firstItem.title,
          hasAnswer: !!firstItem.answer,
          sourcesCount: firstItem.sources?.length || 0
        });
      }
      localStorage.setItem('chatHistory', JSON.stringify(historyItems));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }, [historyItems]);
  
  const { complete, completion, isLoading: completionLoading } = useCompletion({
    api: '/api/chat',
    streamProtocol: 'text',
    onResponse: (response) => {
      if (!response.ok) {
        response.text().then((text) => {
          try {
            const errorData = JSON.parse(text);
            setError(errorData.error || 'Error al procesar tu consulta');
          } catch (e) {
            setError(text || 'Error al procesar tu consulta');
          }
        });
      } else {
        setError(null);
        // Stream will be consumed by the AI SDK
      }
      setIsLoading(false);
    },
    onFinish: (prompt, completion) => {
      // Process the completion
      let finalText = completion;
      let extractedSources: Array<{title: string, url: string}> = []; // To store sources extracted from the response
      
      // Try to extract the text and sources from the completion
      try {
        // Check if the completion contains SSE data format
        const lines = completion.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:') && line !== 'data: [DONE]') {
            try {
              // Extract the JSON payload from the SSE data
              const jsonData = JSON.parse(line.substring(5).trim());
              
              // Update the final text if available
              if (jsonData.text) {
                finalText = jsonData.text;
              }
              
              // Extract sources if available
              if (jsonData.sources && Array.isArray(jsonData.sources)) {
                extractedSources = jsonData.sources.map((source: any) => ({
                  title: source.title || 'Fuente',
                  url: source.url || '#'
                }));
                // Update state for UI rendering
                setSources(extractedSources);
                console.log('Sources extracted:', jsonData.sources);
              }
            } catch (e) {
              console.error('Error parsing SSE data line:', e);
            }
          }
        }
        
        // Fallback for non-SSE format - try to parse the whole completion as JSON
        if ((!finalText || finalText === completion) && extractedSources.length === 0) {
          const jsonStartIndex = completion.indexOf('{');
          const jsonEndIndex = completion.lastIndexOf('}');
          
          if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            const jsonString = completion.substring(jsonStartIndex, jsonEndIndex + 1);
            const jsonData = JSON.parse(jsonString);
            
            if (jsonData.text) {
              finalText = jsonData.text;
            }
            if (jsonData.sources && Array.isArray(jsonData.sources)) {
              extractedSources = jsonData.sources;
              // Update state for UI rendering
              setSources(extractedSources);
              console.log('Sources extracted from JSON:', jsonData.sources);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing completion data:', e);
        // If parsing fails, use the raw completion
      }
      
      // Add the assistant's message to the chat
      setMessages(prev => [...prev, { role: 'assistant', content: finalText }]);
      
      // Add to history when an answer is received
      const questionTitle = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
      
      // Store the answer and extracted sources directly in history
      setHistoryItems(prev => [
        {
          id: Date.now().toString(),
          title: questionTitle,
          timestamp: Date.now(),
          question: prompt, // Store the full question
          answer: finalText, // Store the answer
          sources: extractedSources || [] // Store the extracted sources directly with fallback
        },
        ...prev
      ]);
      
      scrollToBottom();
    },
    onError: (error) => {
      console.error('Error in chat response:', error);
      setError(error.message || 'Error de conexión al servidor');
      setIsLoading(false);
    },
  });
  
  const [input, setInput] = useState('');
  
  // Check for question in URL parameter and submit it automatically
  useEffect(() => {
    // Get the question from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const questionFromUrl = urlParams.get('q');
    
    if (questionFromUrl) {
      console.log('Found question in URL:', questionFromUrl);
      
      // Decode and set the input field with the question from URL
      const decodedQuestion = decodeURIComponent(questionFromUrl);
      setInput(decodedQuestion);
      
      // Short delay to ensure the input is set and component is fully mounted before submitting
      const timer = setTimeout(() => {
        console.log('Auto-submitting question:', decodedQuestion);
        
        // Add the user message to the chat
        const userMessage = { role: 'user' as const, content: decodedQuestion };
        setMessages([userMessage]);
        
        // Start loading state
        setError(null);
        setIsLoading(true);
        
        // Call the completion API directly
        complete(decodedQuestion);
        
        // Show buttons after submitting
        setShowButtons(true);
        
        // Clean the URL to prevent resubmission on refresh
        window.history.replaceState({}, document.title, '/chat');
      }, 500); // Increased timeout for reliability
      
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array as we only want this to run once on mount
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const formatMessage = (content: string) => {
    return (
      <div className={chatStyles.markdownContent} style={{ 
        width: '100%', 
        alignSelf: 'center',
        padding: '0',
        margin: '0',
        overflow: 'visible',
        display: 'block',
        wordWrap: 'break-word'
      }}>
        <ReactMarkdown
          components={{
            // Remove custom code renderer to use default styling
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    
    setError(null);
    setIsLoading(true);
    complete(input.trim());
    
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Show buttons after submitting a question
    setShowButtons(true);
  };

  const startNewChat = () => {
    setMessages([]);
    setInput('');
    setError(null);
    setSources([]);  // Clear sources when starting a new chat
    setShowButtons(false); // Show input box again
  };

  // Function to clear all history
  const clearHistory = () => {
    setHistoryItems([]);
  };

  // Example suggestion cards
  const suggestionCards = [
    {
      id: 1,
      title: "Best science museums",
    },
    {
      id: 2,
      title: "Simulate a mock interview",
    },
    {
      id: 3,
      title: "Imagine an image",
    }
  ];

  // Helper function to check if a URL is a PDF
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

  // Split sources into articles and documents
  const articles = sources.filter(source => !isPdfUrl(source.url));
  const documents = sources.filter(source => isPdfUrl(source.url));

  // Function to download the answer and sources as PDF
  const downloadAnswerAsPdf = () => {
    // This would typically use a library like jsPDF or call a server endpoint
    // For this implementation, we'll create a simple version
    
    let content = "";
    
    // Add question and answer
    messages.forEach(message => {
      if (message.role === 'user') {
        content += `Question: ${message.content}\n\n`;
      } else {
        content += `Answer: ${message.content}\n\n`;
      }
    });
    
    // Add sources
    if (sources.length > 0) {
      content += "Sources:\n";
      sources.forEach(source => {
        content += `- ${source.title}: ${source.url}\n`;
      });
    }
    
    // Create a Blob and download it
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Note: In a real implementation, you would use a PDF generation library
    // or call a server endpoint to generate a proper PDF
  };

  // Function to load a question from history
  const loadQuestionFromHistory = (historyItem: {
    question: string,
    answer?: string,
    sources?: Array<{title: string, url: string}>
  }) => {
    // Reset any errors
    setError(null);
    
    console.log('Loading history item:', historyItem);
    
    // Check if we have a stored answer and sources
    if (historyItem.answer && historyItem.sources) {
      console.log('Found stored answer and sources:', {
        answer: historyItem.answer.substring(0, 50) + '...',
        sourcesCount: historyItem.sources.length
      });
      
      // Use stored data
      setMessages([
        { role: 'user', content: historyItem.question },
        { role: 'assistant', content: historyItem.answer }
      ]);
      
      // Set the stored sources
      setSources(historyItem.sources || []);
      
      // Show buttons instead of input
      setShowButtons(true);
      
      // Scroll to display the conversation
      setTimeout(scrollToBottom, 100);
    } else {
      console.log('Missing stored answer or sources, using fallback');
      // Fallback for older history items without stored answers
      // Clear current chat
      setMessages([]);
      setSources([]);
      
      // Set the question from history
      const userMessage = { role: 'user' as const, content: historyItem.question };
      setMessages([userMessage]);
      
      // Show input box to allow user to resubmit
      setShowButtons(false);
      setInput(historyItem.question);
      
      // Focus on input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  return (
    <>
      {/* Set overflow hidden at the document root level */}
      <style jsx global>{`
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        * {
          overflow-x: hidden; /* Prevent horizontal scrolling everywhere */
        }
      `}</style>
      
      {/* Header matching app/page.tsx */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '62px',
          backgroundColor: '#ffffff', // Removed transparency
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
          borderRadius: '0', // Removed rounded edges
          // Removed backdropFilter blur
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

      {/* Main container - adjust to accommodate header */}
      <div style={{
        ...styles.container,
        marginTop: '62px', // Add margin to account for fixed header
        height: 'calc(100vh - 62px)', // Adjust height for header
        overflow: 'hidden' // Ensure no scrolling at the app level
      }}>
        {/* Left sidebar */}
        <div style={styles.sidebar}>
          <div style={{
            ...styles.sidebarNav,
            marginTop: '16px'
          }}>
            <button style={styles.navButton} onClick={startNewChat}>
              <SquarePen size={18} />
              <span>Nueva Pregunta</span>
            </button>
            
            <button style={styles.navButton}>
              <Bookmark size={18} />
              <span>Saved</span>
            </button>
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
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6', // Purple color
                      marginRight: '8px',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#4b5563',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.historySubtitle}>
                Your conversations will appear here.
              </p>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div style={styles.mainContent}>
          {/* Add the semi-transparent overlay */}
          <div style={styles.contentOverlay}></div>
          
          <div style={styles.contentContainer}>
            {error && (
              <div style={{ 
                backgroundColor: '#fef2f2', 
                color: '#991b1b', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                flexShrink: 0 // Prevent this from being squeezed by flex layout
              }}>
                {error}
              </div>
            )}
            
            {/* Completely restructured layout approach */}
            <div style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              paddingBottom: '0' // Reduced from 68px to eliminate the gap
            }}>
              {/* Q&A section */}
              <div style={{
                flex: '1 1 auto',
                overflowY: 'auto' as const,
                overflowX: 'hidden' as const,
                height: '100%', // Ensure it takes full height
                paddingRight: '16px',
                paddingBottom: '0', // Remove padding from outer container
                paddingTop: '8px'
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    height: '100%',
                    overflowY: 'auto' as const,
                  }}>
                    <h1 style={styles.heading}>Como puedo ayudarte?</h1>
                    
                    <div style={styles.cardGrid}>
                      {suggestionCards.map((card) => (
                        <div key={card.id} style={styles.card}>
                          <div style={styles.cardImage}>
                            <span>Image</span>
                          </div>
                          <div style={styles.cardTitle}>
                            {card.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    ...styles.messageContainer,
                    display: 'flex', 
                    flexDirection: 'column' as const,
                    justifyContent: 'flex-start',
                    height: '100%',
                    overflowY: 'auto' as const,
                    overflowX: 'hidden' as const,
                    paddingRight: '4px',
                    width: '100%',
                    marginBottom: '0',
                    paddingBottom: '68px', // Keep padding only in inner container
                    maxWidth: '100%' // Ensure the container doesn't exceed its bounds
                  }}>
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={message.role === 'assistant' ? chatStyles.botMessageScrollable : ''}
                        style={{
                          ...message.role === 'user' ? styles.userMessage : styles.botMessage,
                          flexDirection: 'column',
                          alignItems: message.role === 'user' ? 'center' : 'flex-start',
                          justifyContent: message.role === 'user' ? 'center' : 'flex-start',
                          width: 'auto',
                          maxWidth: '80%',
                          maxHeight: message.role === 'assistant' ? bubbleMaxHeight : 'none',
                          overflow: message.role === 'assistant' ? 'auto' : 'hidden',
                        }}
                      >
                        {formatMessage(message.content)}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div style={styles.botMessage}>
                        <div style={{
                          fontSize: '15px',
                          color: '#4b5563',
                          fontStyle: 'italic'
                        }}>
                          {loadingText}...
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Sources section */}
              {messages.length > 0 && (
                <div style={{
                  width: '260px',
                  flexShrink: 0,
                  paddingTop: '8px',
                  paddingBottom: '68px', // Add padding to account for input area height
                  borderLeft: '1px solid #e5e7eb',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  background: 'rgba(252, 252, 252, 0.97)',
                  boxSizing: 'border-box',
                  overflowX: 'hidden'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#4b5563',
                    padding: '4px 12px 8px',
                    position: 'sticky' as const,
                    top: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.97)',
                    zIndex: 10,
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)'
                  }}>
                    Fuentes
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto' as const,
                    overflowX: 'visible' as const,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: '8px',
                    padding: '8px 12px 68px 12px', // Increase bottom padding to account for input area
                    boxSizing: 'border-box',
                    width: '100%'
                  }}>
                    {sources.length > 0 ? (
                      <>
                        {/* Artículos header - Complete fix for visibility */}
                        <h3 style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          minHeight: '32px',
                          padding: '12px 0',
                          margin: '4px 0 12px 0',
                          borderBottom: '2px solid #3b82f6',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          lineHeight: '1.6',
                          color: '#1e293b',
                          textRendering: 'optimizeLegibility',
                          boxSizing: 'border-box',
                          overflow: 'visible'
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            marginRight: '8px',
                            flexShrink: 0
                          }}></div>
                          <span style={{
                            display: 'block', 
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}>Artículos</span>
                        </h3>
                        {articles.length > 0 ? (
                          articles.map((source, index) => (
                            <div key={`article-wrapper-${index}`} style={{
                              overflow: 'visible', 
                              width: '100%',
                              margin: '0 0 8px 0'
                            }}>
                              <SourceCard key={`article-${index}`} title={source.title} url={source.url} />
                            </div>
                          ))
                        ) : (
                          <div style={{
                            padding: '8px',
                            color: '#6b7280',
                            fontSize: '12px',
                            fontStyle: 'italic',
                            textAlign: 'center'
                          }}>
                            No hay artículos disponibles
                          </div>
                        )}
                        
                        {/* Documentos header - Complete fix for visibility */}
                        <h3 style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          minHeight: '32px',
                          padding: '12px 0',
                          margin: '16px 0 12px 0',
                          borderBottom: '2px solid #ef4444',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          lineHeight: '1.6',
                          color: '#1e293b',
                          textRendering: 'optimizeLegibility',
                          boxSizing: 'border-box',
                          overflow: 'visible'
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            marginRight: '8px',
                            flexShrink: 0
                          }}></div>
                          <span style={{
                            display: 'block', 
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}>Documentos</span>
                        </h3>
                        {documents.length > 0 ? (
                          documents.map((source, index) => (
                            <div key={`document-wrapper-${index}`} style={{
                              overflow: 'visible', 
                              width: '100%',
                              margin: '0 0 8px 0'
                            }}>
                              <DocumentItem key={`document-${index}`} title={source.title} url={source.url} />
                            </div>
                          ))
                        ) : (
                          <div style={{
                            padding: '8px',
                            color: '#6b7280',
                            fontSize: '12px',
                            fontStyle: 'italic',
                            textAlign: 'center'
                          }}>
                            No hay documentos disponibles
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        padding: '16px',
                        fontSize: '13px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '20px 0'
                      }}>
                        Buscando fuentes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Input area - adjusted to account for sidebar */}
          <div style={{
            ...styles.inputContainer,
            left: '280px',  // Match sidebar width
            right: 0
          }}>
            <div style={styles.inputForm}>
              {!showButtons ? (
                // Show input form when not showing buttons
                <form ref={formRef} onSubmit={handleSubmit} style={{margin: 0}}>
                  <div style={styles.inputWrapper}>
                    <textarea
                      ref={textareaRef}
                      style={styles.textarea}
                      placeholder="Ask anything..."
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && formRef.current?.requestSubmit()}
                      rows={1}
                    />
                    
                    <button 
                      type="submit" 
                      style={styles.sendButton}
                      disabled={isLoading || !input.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                // Show buttons after submitting a question
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  width: '100%'
                }}>
                  <button
                    onClick={downloadAnswerAsPdf}
                    style={{
                      backgroundColor: '#64748b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Descargar Respuesta
                  </button>
                  <button
                    onClick={startNewChat}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva Pregunta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 