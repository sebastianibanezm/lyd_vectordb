"use client";

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Send, Search, SquarePen, Bookmark, RefreshCcw, X, FolderPlus, Plus, Folder, Archive, MessageSquare } from 'lucide-react';
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
    minHeight: '38px',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0 42px 0 12px',
    resize: 'none' as const,
    fontSize: '15px',
    outline: 'none',
    lineHeight: '1.5',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 13,
    color: '#000000',
    overflow: 'hidden',
    marginTop: '0',
    marginBottom: '0',
    paddingTop: '8px',   // Add paddingTop for proper vertical alignment
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
    backgroundColor: '#000000',
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
    backgroundColor: 'white',
    color: '#000000',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '38px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    overflow: 'visible',
    boxSizing: 'border-box' as const,
    width: 'fit-content',
    wordBreak: 'break-word' as const,
    border: '1px solid #e5e7eb'
  },
  botMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    padding: '20px',
    borderRadius: '18px',
    fontSize: '15px',
    margin: '12px 0',
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: '38px',
    width: 'fit-content',
    overflow: 'auto',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-word' as const,
    border: '1px solid rgba(0, 0, 0, 0.05)'
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
    zIndex: 12,
    maxHeight: '200px',
    overflow: 'hidden'
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
      if (historyItems.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(historyItems));
      }
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
      
      // After receiving an answer to a new question, scroll to the question
      // This allows the user to see the context of the answer
      setTimeout(scrollToQuestion, 500);
    },
    onError: (error) => {
      console.error('Error in chat response:', error);
      setError(error.message || 'Error de conexión al servidor');
      setIsLoading(false);
    },
  });
  
  const [input, setInput] = useState('');
  
  // Ensure proper scroll behavior - modified to allow completely free scrolling
  useEffect(() => {
    // Only scroll to bottom on the very first load of messages
    if (messagesEndRef.current && messages.length === 1) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
    }
    // No auto-scrolling for existing conversations
  }, [messages]);

  // Function to scroll to the top of the chat container
  const scrollToTop = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = 0;
    }
  };

  // Function to scroll to the bottom of the chat container - only used for initial load
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  };

  useEffect(() => {
    // Get the question or stored question key from URL if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const questionFromUrl = urlParams.get('q');
    const storedQuestionKey = urlParams.get('stored');
    
    if (storedQuestionKey) {
      console.log('Found stored question key in URL:', storedQuestionKey);
      
      try {
        // Retrieve the stored question data
        const storedQuestionData = localStorage.getItem(storedQuestionKey);
        if (storedQuestionData) {
          const parsedData = JSON.parse(storedQuestionData);
          
          // Set up the messages with both question and answer
          setMessages([
            { role: 'user', content: parsedData.question },
            { role: 'assistant', content: parsedData.answer }
          ]);
          
          // Set the sources if available
          if (parsedData.sources && Array.isArray(parsedData.sources)) {
            setSources(parsedData.sources);
          }
          
          // Set up the UI state for viewing a completed conversation
          setIsLoading(false);
          setError(null);
          
          // Clean the URL to prevent reloading on refresh
          window.history.replaceState({}, document.title, '/chat');
          
          // Reset scroll to top after a short delay
          setTimeout(scrollToTop, 100);
        }
      } catch (error) {
        console.error('Error loading stored question:', error);
      }
    } else if (questionFromUrl) {
      console.log('Found question in URL:', questionFromUrl);
      
      // Decode the question from URL
      const decodedQuestion = decodeURIComponent(questionFromUrl);
      
      // Display the user's question immediately
      const userMessage = { role: 'user' as const, content: decodedQuestion };
      setMessages([userMessage]);
      
      // Set error, loading states
      setError(null);
      setIsLoading(true);
      
      // Call the completion API directly with the decoded question
      complete(decodedQuestion);
      
      // Clean the URL to prevent resubmission on refresh
      window.history.replaceState({}, document.title, '/chat');
      
      // Reset scroll to top
      setTimeout(scrollToTop, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array as we only want this to run once on mount
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (textareaRef.current) {
      // Reset height first to get correct scrollHeight
      textareaRef.current.style.height = '38px';
      
      // Set new height based on content (min 38px, max 200px)
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 38), 200);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Adjust the input wrapper height to match
      if (textareaRef.current.parentElement) {
        textareaRef.current.parentElement.style.height = `${newHeight}px`;
      }
    }
  };

  // Function to scroll to the user's question
  const scrollToQuestion = () => {
    const chatContainer = document.getElementById('chat-container');
    const userMessages = document.querySelectorAll('#chat-container > div');
    
    if (chatContainer && userMessages.length > 0) {
      // Get the last user message (the most recent question)
      // We find the last user message by checking divs that have user styling
      let lastUserMessageIndex = -1;
      for (let i = userMessages.length - 1; i >= 0; i--) {
        if (userMessages[i].querySelector('[class*="userMessageContent"]')) {
          lastUserMessageIndex = i;
          break;
        }
      }
      
      if (lastUserMessageIndex >= 0) {
        // Scroll to position the user message at the top of the visible area
        const userMessage = userMessages[lastUserMessageIndex];
        const containerTop = chatContainer.getBoundingClientRect().top;
        const messageTop = userMessage.getBoundingClientRect().top;
        const offset = messageTop - containerTop - 20; // 20px padding
        
        chatContainer.scrollBy({ top: offset, behavior: 'smooth' });
      }
    }
  };

  // Update the ensureProperScroll function to use scrollToQuestion
  const ensureProperScroll = () => {
    // If this is a new conversation (first message), scroll to bottom
    if (messages.length <= 1) {
      setTimeout(scrollToBottom, 300);
    } 
    // For subsequent messages in the same conversation, scroll to the question
    else {
      setTimeout(scrollToQuestion, 300);
    }
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
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '38px';
      if (textareaRef.current.parentElement) {
        textareaRef.current.parentElement.style.height = '38px';
    }
    }
    
    // For new questions, we still want to scroll to see the input
    ensureProperScroll();
  };

  const startNewChat = () => {
    setMessages([]);
    setInput('');
    setError(null);
    setSources([]);  // Clear sources when starting a new chat
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
      
      // Scroll to display the conversation from the top
      setTimeout(scrollToTop, 100);
    } else {
      console.log('Missing stored answer or sources, using fallback');
      // Fallback for older history items without stored answers
      // Clear current chat
      setMessages([]);
      setSources([]);
      
      // Set the input with the question from history so user can resubmit
      setInput(historyItem.question);
      
      // Focus on input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const [showSaveToCarpetaDialog, setShowSaveToCarpetaDialog] = useState(false);
  const [carpetas, setCarpetas] = useState<Array<{id: string, name: string, timestamp: number, questions: any[]}>>([]); 
  const [selectedCarpetaId, setSelectedCarpetaId] = useState<string | null>(null);
  const [newCarpetaName, setNewCarpetaName] = useState('');
  const [isCreatingCarpeta, setIsCreatingCarpeta] = useState(false);
  
  // Load carpetas
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

  // Handle saving current question to carpeta
  const saveQuestionToCarpeta = () => {
    if (!selectedCarpetaId || messages.length < 2) return;
    
    // Get the question and answer from messages
    const questionMessage = messages.find(msg => msg.role === 'user');
    const answerMessage = messages.find(msg => msg.role === 'assistant');
    
    if (!questionMessage || !answerMessage) return;
    
    // Find the selected carpeta
    const selectedCarpeta = carpetas.find(carpeta => carpeta.id === selectedCarpetaId);
    if (!selectedCarpeta) return;
    
    // Check if question already exists in the carpeta
    const questionExists = selectedCarpeta.questions.some(
      question => question.originalQuestion === questionMessage.content
    );
    
    if (questionExists) {
      // Show error message that question already exists
      alert(`La pregunta ya esta en la carpeta ${selectedCarpeta.name}`);
      return;
    }
    
    // Create the question object
    const questionToSave = {
      id: Date.now().toString(),
      title: questionMessage.content.length > 60 
        ? questionMessage.content.substring(0, 60) + '...' 
        : questionMessage.content,
      originalQuestion: questionMessage.content,
      timestamp: Date.now(),
      answer: answerMessage.content,
      sources: sources || []
    };
    
    // Update the selected carpeta
    const updatedCarpetas = carpetas.map(carpeta => {
      if (carpeta.id === selectedCarpetaId) {
        return {
          ...carpeta,
          questions: [...carpeta.questions, questionToSave]
        };
      }
      return carpeta;
    });
    
    // Save updated carpetas
    setCarpetas(updatedCarpetas);
    localStorage.setItem('carpetas', JSON.stringify(updatedCarpetas));
    
    // Close dialog
    setShowSaveToCarpetaDialog(false);
    setSelectedCarpetaId(null);
    
    // Show success notification
    alert('Pregunta guardada en carpeta');
  };
  
  // Handle creating a new carpeta
  const handleCreateCarpeta = () => {
    if (!newCarpetaName.trim()) return;
    
    const newCarpeta = {
      id: Date.now().toString(),
      name: newCarpetaName.trim(),
      timestamp: Date.now(),
      questions: []
    };
    
    const updatedCarpetas = [...carpetas, newCarpeta];
    setCarpetas(updatedCarpetas);
    localStorage.setItem('carpetas', JSON.stringify(updatedCarpetas));
    
    // Select the newly created carpeta
    setSelectedCarpetaId(newCarpeta.id);
    setNewCarpetaName('');
    setIsCreatingCarpeta(false);
  };

  const formatMessage = (content: string, isUserMessage: boolean = false) => {
    // Preprocess content to ensure proper list formatting
    let processedContent = content;
    
    // Ensure proper spacing for list items, especially if they contain nested markdown
    processedContent = processedContent.replace(/^(\d+)\.\s+\*\*([^*]+)\*\*/gm, '$1. **$2**');
    
    return (
      <div className={`${chatStyles.markdownContent} ${isUserMessage ? chatStyles.userMessageContent : chatStyles.botMessageContent}`} style={{ 
        width: '100%', 
        alignSelf: isUserMessage ? 'center' : 'flex-start',
        padding: isUserMessage ? '0' : '0',
        margin: '0',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: isUserMessage ? 'center' : 'flex-start',
        wordWrap: 'break-word',
        maxWidth: '100%'
      }}>
        <ReactMarkdown
          components={{
            // Enhanced styling for more consistent spacing and formatting
            p: ({node, ...props}) => <p style={{margin: '10px 0', lineHeight: '1.5', fontSize: '15px'}} {...props} />,
            
            // Enhanced list styling with proper indentation and bullet points
            ul: ({node, ...props}) => (
              <ul style={{
                paddingLeft: '24px', 
                margin: '12px 0',
                listStyleType: 'disc',
                listStylePosition: 'outside',
                display: 'block',
                width: '100%'
              }} {...props} />
            ),
            
            // Enhanced ordered list styling with proper numbering
            ol: ({node, ...props}) => (
              <ol style={{
                paddingLeft: '24px', 
                margin: '12px 0',
                listStyleType: 'decimal',
                listStylePosition: 'outside',
                display: 'block',
                width: '100%'
              }} {...props} />
            ),
            
            // Enhanced list item styling with proper spacing and nested content handling
            li: ({node, children, ...props}) => {
              // Check if the child is another list to handle nested lists properly
              const hasNestedList = React.Children.toArray(children).some(
                child => React.isValidElement(child) && (child.type === 'ul' || child.type === 'ol')
              );
              
              return (
                <li style={{
                  margin: hasNestedList ? '4px 0 0 0' : '4px 0 8px 0',
                  lineHeight: '1.5',
                  fontSize: '15px',
                  display: 'list-item', // Ensure it displays as a list item
                  padding: '0 0 0 4px', // Add a bit of padding for better readability
                  width: '100%',       // Ensure list items take full width
                  position: 'relative' // Helps with positioning markers
                }} {...props}>
                  {children}
                </li>
              );
            },
            
            // Handle strong/bold text properly, especially in lists
            strong: ({node, ...props}) => (
              <strong style={{
                fontWeight: 'bold',
                display: 'inline'  // Ensure inline display
              }} {...props} />
            ),
            
            h1: ({node, ...props}) => <h1 style={{margin: '18px 0 12px 0', lineHeight: '1.3', fontSize: '1.5em', fontWeight: 'bold'}} {...props} />,
            h2: ({node, ...props}) => <h2 style={{margin: '16px 0 10px 0', lineHeight: '1.3', fontSize: '1.3em', fontWeight: 'bold'}} {...props} />,
            h3: ({node, ...props}) => <h3 style={{margin: '14px 0 8px 0', lineHeight: '1.3', fontSize: '1.15em', fontWeight: 'bold'}} {...props} />,
            h4: ({node, ...props}) => <h4 style={{margin: '10px 0 8px 0', lineHeight: '1.3', fontSize: '1.05em', fontWeight: 'bold'}} {...props} />,
            blockquote: ({node, ...props}) => <blockquote style={{borderLeft: '4px solid #e5e7eb', paddingLeft: '16px', margin: '12px 0', fontStyle: 'italic', color: '#4b5563'}} {...props} />,
            // Simplify code component to avoid type issues
            code: ({node, ...props}) => <code style={{backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9em'}} {...props} />,
            pre: ({node, ...props}) => <pre style={{margin: '12px 0', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', overflowX: 'auto'}} {...props} />
          }}
        >
          {processedContent}
        </ReactMarkdown>
        
        {/* Add custom CSS to ensure proper list styling */}
        <style jsx>{`
          div :global(ol),
          div :global(ul) {
            list-style-position: outside;
            margin-bottom: 16px;
            padding-left: 24px;
            width: 100%;
          }
          
          div :global(ol) {
            list-style-type: decimal;
          }
          
          div :global(ul) {
            list-style-type: disc;
          }
          
          div :global(li) {
            display: list-item;
            margin-bottom: 8px;
            padding-left: 4px;
          }
          
          /* Ensure nested lists are properly indented */
          div :global(li > ul),
          div :global(li > ol) {
            margin-top: 8px;
            margin-bottom: 0;
          }
          
          /* Ensure strong text (bold) displays properly in lists */
          div :global(li strong) {
            font-weight: bold;
            display: inline;
          }
        `}</style>
      </div>
    );
  };

  // Reset scroll position on initial load
  useEffect(() => {
    // Only run once on component mount
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      // Reset to top
      chatContainer.scrollTop = 0;
    }
  }, []);

  // Fix the "addToBibliography" function (it was missing)
  const addToBibliography = (source: {title: string, url: string}, e: React.MouseEvent) => {
    e.preventDefault();
    // This would typically add the source to a bibliography
    // For now, just show a notification
    alert(`Added "${source.title}" to bibliography`);
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
        #chat-container {
          overflow-y: auto !important;
          scroll-behavior: auto !important;
          overscroll-behavior: auto !important;
          height: 100% !important;
          position: relative !important;
        }
        #chat-container * {
          overflow: visible !important; /* Allow overflow in all chat container children */
        }
        .botMessageScrollable {
          overflow: visible !important; /* Make assistant messages fully visible without scrolling */
          max-height: none !important;
        }
      `}</style>
      
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
          overflow: 'visible' /* Ensure header doesn't clip its children */
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px', 
          flexShrink: 0,
          position: 'relative', /* Create stacking context */
          zIndex: 10000, /* Higher than header */
          overflow: 'visible' /* Ensure no clipping */
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            position: 'relative', /* Create stacking context */
            overflow: 'visible' /* Ensure no clipping */
          }}>
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
              boxSizing: 'border-box',
              overflow: 'visible',
              zIndex: 10000 /* Ensure button stays above other elements */
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
                height: '2px',
                backgroundColor: '#ec4899',
                zIndex: 10001, /* Even higher z-index */
                pointerEvents: 'none'
              }}></div>
              
              {/* Pink line at the right side of the button */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '2px',
                height: 'calc(100% + 4px)',
                backgroundColor: '#ec4899',
                zIndex: 10001, /* Even higher z-index */
                pointerEvents: 'none'
              }}></div>
              
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
            
            <Link href="/carpetas" style={styles.navButton}>
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
                      {item.title}
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
                    <h1 style={{
                      background: 'linear-gradient(135deg, #ec4899 30%, #8b5cf6 70%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      display: 'block',
                      fontSize: '2.24rem',
                      fontWeight: 'bold',
                      lineHeight: '1.1',
                      paddingTop: '32px',
                      paddingBottom: '5px',
                      paddingLeft: '15%',
                      paddingRight: '15%',
                      borderBottom: '1px solid transparent',
                      wordWrap: 'break-word',
                      maxWidth: '100%',
                      marginBottom: '48px',
                      textAlign: 'center'
                    }}>Toda la información social, politica y economica de Chile en un solo lugar</h1>
                    
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
                    paddingBottom: '80px', // Increased padding to ensure space for input
                    paddingTop: '28px', // Increased from 20px to 28px for more space at the top
                    maxWidth: '100%', // Ensure the container doesn't exceed its bounds
                    position: 'relative', // Ensure proper positioning
                    scrollBehavior: 'auto' // Use browser default scrolling
                  }}
                  id="chat-container"
                  >
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        style={{
                          display: 'flex', 
                          width: '100%',
                          alignItems: 'center',
                          position: 'relative',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                          marginBottom: '16px',
                          marginTop: '12px', // Increased from 8px to 12px
                          padding: '2px 4px', // Added padding on top and bottom
                          overflow: 'visible' // Ensure overflow is visible
                        }}
                      >
                        <div 
                          className={message.role === 'assistant' ? chatStyles.botMessageScrollable : ''}
                          style={{
                            ...message.role === 'user' ? styles.userMessage : styles.botMessage,
                            flexDirection: 'column',
                            alignItems: message.role === 'user' ? 'center' : 'flex-start',
                            justifyContent: 'center',
                            width: 'auto',
                            maxWidth: '80%',
                            maxHeight: 'none',
                            overflow: 'visible',
                            marginRight: message.role === 'user' ? '8px' : '0',
                            marginLeft: message.role === 'assistant' ? '8px' : '0',
                            borderRadius: message.role === 'user' ? '12px' : '18px',
                            whiteSpace: 'pre-wrap',
                            padding: message.role === 'assistant' ? '20px 20px' : '12px 16px'
                          }}
                        >
                          {formatMessage(message.content, message.role === 'user')}
                        </div>
                        
                        {/* Action buttons - only show for assistant's last message */}
                        {message.role === 'assistant' && index === messages.length - 1 && messages.length > 1 && (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginLeft: '12px',
                            alignSelf: 'flex-start',
                            position: 'relative',
                            paddingTop: '20px' // Align with the message padding-top
                          }}>
                            {/* Save to Carpeta Button */}
                            <button
                              onClick={() => setShowSaveToCarpetaDialog(true)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                color: 'black',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                padding: '0'
                              }}
                              title="Guardar en Carpeta"
                              type="button"
                            >
                              <FolderPlus size={14} />
                            </button>

                            {/* Download Button */}
                            <button
                              onClick={downloadAnswerAsPdf}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#64748b',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                padding: '0'
                              }}
                              title="Descargar Respuesta"
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div style={{
                        ...styles.botMessage,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60px' // Ensure consistent height for loading message
                      }}>
                        <div style={{
                          fontSize: '15px',
                          color: '#4b5563',
                          fontStyle: 'italic',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          padding: '0 8px'
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
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
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
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
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
              <form ref={formRef} onSubmit={handleSubmit} style={{margin: 0}}>
                <div style={{
                  ...styles.inputWrapper,
                  // Ensure consistent input wrapper styles
                  transition: 'height 0.2s ease'
                }}>
                  <textarea
                    ref={textareaRef}
                    style={styles.textarea}
                    placeholder="Que deseas saber?"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        formRef.current?.requestSubmit();
                      }
                    }}
                    rows={1}
                  />
                  
                  <button 
                    type="submit" 
                    style={{
                      ...styles.sendButton,
                      opacity: isLoading || !input.trim() ? 0.5 : 1
                    }}
                    disabled={isLoading || !input.trim()}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save to Carpeta Dialog */}
      {showSaveToCarpetaDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1e293b',
                margin: 0
              }}>Guardar en Carpeta</h3>
              <button
                onClick={() => setShowSaveToCarpetaDialog(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px'
                }}
              >
                  <X size={24} color="#64748b" />
                </button>
            </div>

            {/* Create new carpeta option */}
            {!isCreatingCarpeta ? (
              <button
                onClick={() => setIsCreatingCarpeta(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px dashed #94a3b8',
                  borderRadius: '8px',
                  color: '#4b5563',
                  fontWeight: 500,
                  fontSize: '15px',
                  width: '100%',
                  cursor: 'pointer',
                  justifyContent: 'center'
                }}
              >
                <Plus size={18} />
                <span>Nueva Carpeta</span>
              </button>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <input
                  type="text"
                  placeholder="Nombre de la carpeta"
                  value={newCarpetaName}
                  onChange={(e) => setNewCarpetaName(e.target.value)}
                  autoFocus
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '15px',
                    color: '#1e293b',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCarpeta()}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={handleCreateCarpeta}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => setIsCreatingCarpeta(false)}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Carpetas list */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#4b5563',
                margin: '0 0 12px 0'
              }}>
                Selecciona una carpeta
              </h4>
              
              {carpetas.length === 0 ? (
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '16px 0'
                }}>
                  No hay carpetas disponibles. Crea una nueva carpeta.
                </p>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {carpetas.map(carpeta => (
                    <div
                      key={carpeta.id}
                      onClick={() => setSelectedCarpetaId(carpeta.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: carpeta.id === selectedCarpetaId ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: carpeta.id === selectedCarpetaId ? '#3b82f6' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Folder size={18} color={carpeta.id === selectedCarpetaId ? 'white' : '#64748b'} />
                      </div>
                      <div>
                        <p style={{
                          margin: '0 0 2px 0',
                          fontWeight: 500,
                          color: '#1e293b',
                          fontSize: '15px'
                        }}>
                          {carpeta.name}
                        </p>
                        <span style={{
                          fontSize: '13px',
                          color: '#64748b'
                        }}>
                          {carpeta.questions.length} {carpeta.questions.length === 1 ? 'pregunta' : 'preguntas'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '16px'
            }}>
              <button
                onClick={() => setShowSaveToCarpetaDialog(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveQuestionToCarpeta}
                disabled={!selectedCarpetaId}
                style={{
                  padding: '10px 16px',
                  backgroundColor: selectedCarpetaId ? '#3b82f6' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: selectedCarpetaId ? 'pointer' : 'not-allowed'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 