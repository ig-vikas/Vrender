import React, { useRef } from 'react';
import { Edit2, Check, RefreshCw } from 'lucide-react';

export default function SubHeader({ docTitle, setDocTitle, isSaved }) {
  const inputRef = useRef(null);

  return (
    <div className="vrender-subheader">
      <div className="subheader-left">
        <input
          ref={inputRef}
          type="text"
          className="doc-title-input"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Untitled Document"
          aria-label="Document Title"
        />
        <Edit2 
          size={13} 
          color="#828997" 
          style={{ cursor: 'pointer' }} 
          onClick={() => inputRef.current?.focus()} 
          title="Rename Document"
        />
        
        <div className={`saved-badge ${isSaved ? 'saved' : ''}`}>
          {isSaved ? (
            <>
              <Check size={14} color="#3cb371" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <RefreshCw size={12} className="spin" />
              <span>Saving...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
