import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Upload, Image as ImageIcon, Download, 
  Eye, Maximize2, Minimize2, Settings, HelpCircle, ChevronDown, 
  FileText, Code, FileCode, File
} from 'lucide-react';
import { exportMarkdown, exportRawHTML, exportStyledHTML, exportPDF } from '../utils/exporter';

export default function Header({
  onToggleLeftDrawer,
  onToggleRightDrawer,
  onOpenImportModal,
  onOpenImageModal,
  onOpenHelpModal,
  docTitle,
  content,
  viewMode,
  setViewMode,
  isFullscreen,
  setIsFullscreen
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (type) => {
    setExportOpen(false);
    if (type === 'md') exportMarkdown(docTitle, content);
    if (type === 'html') exportRawHTML(docTitle, content);
    if (type === 'styled-html') exportStyledHTML(docTitle, content);
    if (type === 'pdf') exportPDF(docTitle, content);
  };

  const toggleViewMode = () => {
    if (viewMode === 'split') setViewMode('editor');
    else if (viewMode === 'editor') setViewMode('preview');
    else setViewMode('split');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="vrender-header">
      <div className="header-left">
        <button 
          className="menu-toggle-btn" 
          onClick={onToggleLeftDrawer}
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div className="brand-logo" onClick={onToggleLeftDrawer}>
          <span style={{ color: '#10a37f' }}>V</span>RENDER
        </div>
      </div>

      <div className="header-right">
        {/* Import Button */}
        <button className="nav-action-btn" onClick={onOpenImportModal} title="Import File">
          <Upload size={16} />
          <span>Import</span>
        </button>

        {/* Image Button */}
        <button className="nav-action-btn" onClick={onOpenImageModal} title="Insert Image">
          <ImageIcon size={16} />
          <span>Image</span>
        </button>

        {/* Export Dropdown */}
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="nav-action-btn export-btn" 
            onClick={() => setExportOpen(!exportOpen)}
            title="Export Options"
          >
            <Download size={16} />
            <span>Export as</span>
            <ChevronDown size={14} />
          </button>

          {exportOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleExport('md')}>
                <FileText size={16} />
                <span>Markdown</span>
              </div>
              <div className="dropdown-item" onClick={() => handleExport('html')}>
                <Code size={16} />
                <span>HTML</span>
              </div>
              <div className="dropdown-item" onClick={() => handleExport('styled-html')}>
                <FileCode size={16} />
                <span>Styled HTML</span>
              </div>
              <div className="dropdown-item" onClick={() => handleExport('pdf')}>
                <File size={16} />
                <span>PDF</span>
              </div>
            </div>
          )}
        </div>

        {/* View Mode Toggle Button */}
        <button 
          className="nav-action-btn icon-btn" 
          onClick={toggleViewMode} 
          title={`View Mode: ${viewMode.toUpperCase()} (Click to switch)`}
        >
          <Eye size={18} color={viewMode !== 'split' ? '#3cb371' : '#d8dee9'} />
        </button>

        {/* Fullscreen Toggle Button */}
        <button 
          className="nav-action-btn icon-btn" 
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Settings Toggle Button */}
        <button 
          className="nav-action-btn icon-btn" 
          onClick={onToggleRightDrawer}
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* Help / Cheatsheet Modal Button */}
        <button 
          className="nav-action-btn icon-btn" 
          onClick={onOpenHelpModal}
          title="Markdown Help & Shortcuts"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
