import React, { useState } from 'react';
import { 
  X, Plus, FileText, Trash2, Copy, Edit3, 
  Cloud, HardDrive, Database, Globe, Share2, RefreshCw
} from 'lucide-react';

const GithubIcon = ({ size = 16, color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function LeftSidebar({
  isOpen,
  onClose,
  documents,
  currentDocId,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  onDuplicateDoc,
  onRenameDoc,
  onResetSample,
  onClearText
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const startRename = (doc) => {
    setEditingId(doc.id);
    setEditingTitle(doc.title);
  };

  const handleSaveRename = (docId) => {
    if (editingTitle.trim()) {
      onRenameDoc(docId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCloudConnect = (serviceName) => {
    setToastMessage(`Connecting to ${serviceName}... (Mock Integration)`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className={`drawer left-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <span style={{ color: '#10a37f' }}>VI</span>RENDER
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {toastMessage && (
            <div style={{
              backgroundColor: 'rgba(60, 179, 113, 0.2)',
              border: '1px solid #3cb371',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              {toastMessage}
            </div>
          )}



          {/* DOCUMENTS SECTION */}
          <div className="drawer-section">
            <div className="drawer-section-title">Documents</div>
            
            <button className="new-doc-btn" onClick={onCreateDoc}>
              <Plus size={16} />
              <span>New Document</span>
            </button>

            <div className="doc-list">
              {documents.map((doc) => {
                const isActive = doc.id === currentDocId;
                const isEditing = doc.id === editingId;

                return (
                  <div 
                    key={doc.id} 
                    className={`doc-item ${isActive ? 'active' : ''}`}
                    onClick={() => !isEditing && onSelectDoc(doc.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <FileText size={16} color={isActive ? '#3cb371' : '#828997'} />
                      
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleSaveRename(doc.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(doc.id)}
                          autoFocus
                          style={{
                            background: '#282c34',
                            border: '1px solid #3cb371',
                            color: '#fff',
                            borderRadius: '3px',
                            padding: '2px 4px',
                            fontSize: '13px',
                            width: '120px'
                          }}
                        />
                      ) : (
                        <span className="doc-item-title">{doc.title}</span>
                      )}
                    </div>

                    <div className="doc-item-actions">
                      <button 
                        className="doc-action-btn" 
                        onClick={(e) => { e.stopPropagation(); startRename(doc); }}
                        title="Rename"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        className="doc-action-btn" 
                        onClick={(e) => { e.stopPropagation(); onDuplicateDoc(doc.id); }}
                        title="Duplicate"
                      >
                        <Copy size={13} />
                      </button>
                      <button 
                        className="doc-action-btn delete" 
                        onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }}
                        title="Delete Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </div>
      </div>
    </>
  );
}
