import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, HelpCircle, FileText, Check } from 'lucide-react';

/**
 * Import File Modal
 */
export function ImportModal({ isOpen, onClose, onImportFile }) {
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      onImportFile(file.name.replace(/\.[^/.]+$/, ''), content);
      onClose();
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={20} color="#3cb371" />
            <span>Import Markdown or Text File</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div 
            className={`file-dropzone ${dragActive ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <Upload size={36} color="#3cb371" style={{ marginBottom: '12px' }} />
            <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
              Drag & Drop your file here
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Supports .md, .markdown, .txt, .html, .text files
            </p>
            <input 
              id="file-upload-input"
              type="file" 
              accept=".md,.markdown,.txt,.html,.text" 
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Image Insertion Modal
 */
export function ImageModal({ isOpen, onClose, onInsertImage }) {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onInsertImage(imageUrl.trim(), altText.trim() || 'Image');
      setImageUrl('');
      setAltText('');
      onClose();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64) {
          setImageUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={20} color="#3cb371" />
            <span>Insert Image</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="https://example.com/image.png" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: '12px 0 6px 0', textAlign: 'center' }}>
              OR UPLOAD FROM COMPUTER
            </div>

            <div className="form-group">
              <input 
                type="file" 
                accept="image/*" 
                className="form-input" 
                onChange={handleFileUpload} 
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Alt Description</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Project Architecture Diagram" 
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>

            {imageUrl && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <p className="form-label">Preview:</p>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  style={{ maxHeight: '120px', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Insert Image</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Help & Markdown Cheatsheet Modal
 */
export function HelpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('cheatsheet');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="#3cb371" />
            <span>Markdown Help & Shortcuts</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', padding: '0 20px', backgroundColor: 'var(--bg-subheader)' }}>
          <button 
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'cheatsheet' ? '2px solid #3cb371' : 'none',
              color: activeTab === 'cheatsheet' ? '#3cb371' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('cheatsheet')}
          >
            Markdown Cheatsheet
          </button>
          <button 
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'shortcuts' ? '2px solid #3cb371' : 'none',
              color: activeTab === 'shortcuts' ? '#3cb371' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('shortcuts')}
          >
            Keyboard Shortcuts
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'cheatsheet' ? (
            <table className="markdown-body" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Markdown Syntax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Heading 1</strong></td>
                  <td><code># Heading 1</code></td>
                </tr>
                <tr>
                  <td><strong>Heading 2</strong></td>
                  <td><code>## Heading 2</code></td>
                </tr>
                <tr>
                  <td><strong>Bold</strong></td>
                  <td><code>**Bold text**</code></td>
                </tr>
                <tr>
                  <td><strong>Italic</strong></td>
                  <td><code>*Italic text*</code></td>
                </tr>
                <tr>
                  <td><strong>Unordered List</strong></td>
                  <td><code>* Item 1</code></td>
                </tr>
                <tr>
                  <td><strong>Ordered List</strong></td>
                  <td><code>1. First item</code></td>
                </tr>
                <tr>
                  <td><strong>Link</strong></td>
                  <td><code>[Title](https://vrender.io)</code></td>
                </tr>
                <tr>
                  <td><strong>Image</strong></td>
                  <td><code>![Alt text](image.png)</code></td>
                </tr>
                <tr>
                  <td><strong>Code Block</strong></td>
                  <td><code>```cpp ... ```</code></td>
                </tr>
                <tr>
                  <td><strong>Blockquote</strong></td>
                  <td><code>&gt; Quote text</code></td>
                </tr>
                <tr>
                  <td><strong>Table</strong></td>
                  <td><code>| Col 1 | Col 2 |</code></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="markdown-body" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Shortcut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Toggle Left Drawer</td>
                  <td><code>Ctrl + Shift + M</code></td>
                </tr>
                <tr>
                  <td>Toggle Settings</td>
                  <td><code>Ctrl + ,</code></td>
                </tr>
                <tr>
                  <td>Toggle View Mode</td>
                  <td><code>Ctrl + Alt + V</code></td>
                </tr>
                <tr>
                  <td>Save Document</td>
                  <td><code>Ctrl + S</code></td>
                </tr>
                <tr>
                  <td>Fullscreen Toggle</td>
                  <td><code>F11</code> / <code>Ctrl + Shift + F</code></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
