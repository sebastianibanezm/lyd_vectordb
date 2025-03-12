"use client";

import { useState, useEffect } from 'react';
import chatStyles from '@/app/chat/ChatPage.module.css';

interface DocumentItemProps {
  title: string;
  url: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ title, url }) => {
  const [fileName, setFileName] = useState<string>(title || 'PDF Document');
  
  useEffect(() => {
    // Try to get a better file name from the URL if title is generic or missing
    if (!title || title === 'PDF Document' || title === 'No title available') {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];
        
        if (lastSegment && lastSegment.toLowerCase().endsWith('.pdf')) {
          // Try to make the filename more readable
          const decodedName = decodeURIComponent(lastSegment);
          // Remove the .pdf extension and replace hyphens/underscores with spaces
          const cleanName = decodedName
            .replace(/\.pdf$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word
          
          setFileName(cleanName);
        }
      } catch (e) {
        // If URL parsing fails, keep the original title
      }
    }
  }, [url, title]);
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={chatStyles.documentItem}
      title={fileName}
    >
      <div className={chatStyles.documentIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M9 15v-2h6"></path>
          <path d="M11 13v4"></path>
          <path d="M17 15v2"></path>
        </svg>
      </div>
      <div className={chatStyles.documentTitle}>{fileName}</div>
    </a>
  );
};

export default DocumentItem; 