"use client";

import { useState, useEffect } from 'react';
import chatStyles from '@/app/chat/ChatPage.module.css';

interface SourceCardProps {
  title: string;
  url: string;
}

const SourceCard: React.FC<SourceCardProps> = ({ title, url }) => {
  const [displayTitle, setDisplayTitle] = useState<string>(title || 'Web Article');
  
  useEffect(() => {
    // Try to get a better title from the URL if title is generic or missing
    if (!title || title === 'No title available') {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');
        setDisplayTitle(hostname);
      } catch (e) {
        // If URL parsing fails, keep the original title
        setDisplayTitle(title || 'Web Article');
      }
    }
  }, [url, title]);
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={chatStyles.documentItem}
      title={displayTitle}
    >
      <div className={chatStyles.documentIcon} style={{ color: '#3b82f6' }}>
        {/* Web/Internet Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>
      <div className={chatStyles.documentTitle}>{displayTitle}</div>
    </a>
  );
};

export default SourceCard; 