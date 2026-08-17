import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SubHeader from './components/SubHeader';
import Editor from './components/Editor';
import Preview from './components/Preview';
import LeftSidebar from './components/LeftSidebar';
import SettingsDrawer from './components/SettingsDrawer';
import { ImportModal, ImageModal, HelpModal } from './components/Modals';
import { SAMPLE_MARKDOWN, DEFAULT_DOCUMENT_TITLE } from './utils/sampleDocument';
import './styles/vrender.css';

const LOCAL_DOCS_KEY = 'vrender_documents_v2';
const LOCAL_SETTINGS_KEY = 'vrender_settings_v2';
const LOCAL_CUSTOM_CSS_KEY = 'vrender_custom_css_v1';

export default function App() {
  // Initialize documents state from LocalStorage or default sample
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem(LOCAL_DOCS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'doc-chatgpt-sample-1',
        title: DEFAULT_DOCUMENT_TITLE,
        content: SAMPLE_MARKDOWN,
        updatedAt: Date.now()
      }
    ];
  });

  const [currentDocId, setCurrentDocId] = useState(() => documents[0]?.id || 'doc-chatgpt-sample-1');
  const editorRef = useRef(null);

  // Settings state with ChatGPT Dark Mode enabled by default!
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      autoSave: true,
      wordCount: true,
      charCount: true,
      nightMode: true, // Default ChatGPT Dark Mode ON
      scrollSync: true,
      tabSize: 4,
      keybindings: 'Default'
    };
  });

  // Custom CSS State
  const [customCSS, setCustomCSS] = useState(() => {
    return localStorage.getItem(LOCAL_CUSTOM_CSS_KEY) || '';
  });

  const [editorTheme, setEditorTheme] = useState('OneDark');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  // Splitter state
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Drawer states
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);

  // Modal states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const previewRef = useRef(null);
  const currentDoc = documents.find((d) => d.id === currentDocId) || documents[0];

  // Save documents to LocalStorage
  useEffect(() => {
    if (settings.autoSave) {
      localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(documents));
      setIsSaved(true);
    }
  }, [documents, settings.autoSave]);

  // Save settings to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    if (settings.nightMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [settings]);

  // Save custom CSS to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_CUSTOM_CSS_KEY, customCSS);
  }, [customCSS]);

  // Update content of active document
  const handleContentChange = (newContent) => {
    setIsSaved(false);
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === currentDocId
          ? { ...doc, content: newContent, updatedAt: Date.now() }
          : doc
      )
    );
  };

  // Update title of active document
  const handleTitleChange = (newTitle) => {
    setIsSaved(false);
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === currentDocId ? { ...doc, title: newTitle } : doc
      )
    );
  };

  // Create new document
  const handleCreateDoc = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: `Untitled-${documents.length + 1}`,
      content: '# New Document\n\nStart typing markdown here...',
      updatedAt: Date.now()
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
  };

  // Delete document
  const handleDeleteDoc = (docId) => {
    if (documents.length <= 1) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title: 'Untitled-1',
        content: '# New Document\n\nStart typing markdown here...',
        updatedAt: Date.now()
      };
      setDocuments([newDoc]);
      setCurrentDocId(newDoc.id);
      return;
    }
    const filtered = documents.filter((d) => d.id !== docId);
    setDocuments(filtered);
    if (currentDocId === docId) {
      setCurrentDocId(filtered[0].id);
    }
  };

  // Duplicate document
  const handleDuplicateDoc = (docId) => {
    const target = documents.find((d) => d.id === docId);
    if (!target) return;
    const copyDoc = {
      id: `doc-${Date.now()}`,
      title: `${target.title} (Copy)`,
      content: target.content,
      updatedAt: Date.now()
    };
    setDocuments((prev) => [copyDoc, ...prev]);
    setCurrentDocId(copyDoc.id);
  };

  // Rename specific document
  const handleRenameDoc = (docId, newTitle) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, title: newTitle } : d))
    );
  };

  // Import file handler
  const handleImportFile = (title, content) => {
    const importedDoc = {
      id: `doc-${Date.now()}`,
      title: title || 'Imported File',
      content: content,
      updatedAt: Date.now()
    };
    setDocuments((prev) => [importedDoc, ...prev]);
    setCurrentDocId(importedDoc.id);
  };

  // Insert image markdown snippet at cursor
  const handleInsertImage = (url, alt) => {
    const snippet = `![${alt}](${url})`;
    if (editorRef.current?.view) {
      const view = editorRef.current.view;
      const selection = view.state.selection.main;
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: snippet },
        selection: { anchor: selection.from + snippet.length }
      });
      view.focus();
    } else {
      handleContentChange((currentDoc?.content || '') + '\n' + snippet + '\n');
    }
  };

  // Reset sample document
  const handleResetSample = () => {
    handleContentChange(SAMPLE_MARKDOWN);
    handleTitleChange(DEFAULT_DOCUMENT_TITLE);
  };

  // Clear text
  const handleClearText = () => {
    handleContentChange('');
  };

  // Splitter Dragging Logic
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const totalWidth = window.innerWidth;
      let newRatio = (e.clientX / totalWidth) * 100;
      if (newRatio < 15) newRatio = 15;
      if (newRatio > 85) newRatio = 85;
      setSplitRatio(newRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Synchronized Scrolling
  const handleEditorScroll = (e) => {
    if (!settings.scrollSync || !previewRef.current) return;
    const target = e.target;
    if (!target) return;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    if (!isNaN(percentage)) {
      previewRef.current.scrollTop = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
  };

  // Fullscreen class calculation
  let modeClass = '';
  if (viewMode === 'editor') modeClass = 'fullscreen-editor';
  if (viewMode === 'preview') modeClass = 'fullscreen-preview';

  return (
    <div className={`vrender-app ${modeClass}`}>
      {/* Top Navigation Header */}
      <Header
        onToggleLeftDrawer={() => setLeftDrawerOpen(!leftDrawerOpen)}
        onToggleRightDrawer={() => setRightDrawerOpen(!rightDrawerOpen)}
        onOpenImportModal={() => setImportModalOpen(true)}
        onOpenImageModal={() => setImageModalOpen(true)}
        onOpenHelpModal={() => setHelpModalOpen(true)}
        docTitle={currentDoc?.title || ''}
        content={currentDoc?.content || ''}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />

      {/* Subheader Title Bar */}
      <SubHeader
        docTitle={currentDoc?.title || ''}
        setDocTitle={handleTitleChange}
        isSaved={isSaved}
      />

      {/* Main Split View Workspace */}
      <main className="main-workspace">
        {/* Left Pane: Code Editor */}
        <div style={{ 
          width: viewMode === 'split' ? `${splitRatio}%` : '100%', 
          height: '100%', 
          display: viewMode === 'preview' ? 'none' : 'flex' 
        }}>
          <Editor
            editorRef={editorRef}
            content={currentDoc?.content || ''}
            setContent={handleContentChange}
            settings={settings}
            editorTheme={editorTheme}
            setEditorTheme={setEditorTheme}
            onScroll={handleEditorScroll}
          />
        </div>

        {/* Resizable Divider Handle */}
        {viewMode === 'split' && (
          <div
            className={`split-handle ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Right Pane: Markdown Preview with ChatGPT Dark Mode */}
        <div style={{ 
          width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%', 
          height: '100%',
          display: viewMode === 'editor' ? 'none' : 'block'
        }}>
          <Preview
            content={currentDoc?.content || ''}
            previewRef={previewRef}
            settings={settings}
            customCSS={customCSS}
          />
        </div>
      </main>

      {/* Left Navigation Sidebar Drawer */}
      <LeftSidebar
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        documents={documents}
        currentDocId={currentDocId}
        onSelectDoc={(id) => { setCurrentDocId(id); setLeftDrawerOpen(false); }}
        onCreateDoc={handleCreateDoc}
        onDeleteDoc={handleDeleteDoc}
        onDuplicateDoc={handleDuplicateDoc}
        onRenameDoc={handleRenameDoc}
        onResetSample={handleResetSample}
        onClearText={handleClearText}
      />

      {/* Right Settings Panel Drawer */}
      <SettingsDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        settings={settings}
        setSettings={setSettings}
        customCSS={customCSS}
        setCustomCSS={setCustomCSS}
      />

      {/* Dialog Modals */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportFile={handleImportFile}
      />

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
}
