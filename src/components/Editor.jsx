import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

// Custom clean editor theme — no line numbers, comfortable padding
const cleanEditorTheme = EditorView.theme({
  '&': {
    fontSize: '15px',
    backgroundColor: '#0d0d0d',
  },
  '.cm-content': {
    padding: '20px 28px',
    fontFamily: "'Fira Code', Consolas, Monaco, monospace",
    caretColor: '#10a37f',
    lineHeight: '1.65',
    textAlign: 'left',
  },
  '.cm-cursor': {
    borderLeftColor: '#10a37f',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(16, 163, 127, 0.2) !important',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
});

export default function Editor({
  content,
  setContent,
  settings,
  editorTheme,
  setEditorTheme,
  onScroll,
  editorRef
}) {
  // Calculate word and character count
  const stats = useMemo(() => {
    const text = content || '';
    const charCount = text.length;
    const trimmed = text.trim();
    const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
    return { wordCount, charCount };
  }, [content]);

  // Determine CodeMirror extensions
  const extensions = useMemo(() => {
    const ext = [
      markdown(),
      EditorView.lineWrapping,
      cleanEditorTheme,
      EditorView.domEventHandlers({
        scroll: (event) => {
          if (onScroll && settings.scrollSync) {
            onScroll(event);
          }
        }
      })
    ];
    return ext;
  }, [onScroll, settings.scrollSync]);

  // Determine CodeMirror theme
  const getTheme = () => {
    if (editorTheme === 'OneDark' || (settings.nightMode && editorTheme === 'Default')) {
      return oneDark;
    }
    return undefined;
  };

  return (
    <div className="editor-container" style={{ flex: 1 }}>
      <div className="editor-scroll-area">
        <CodeMirror
          ref={editorRef}
          value={content}
          height="100%"
          className="codemirror-wrapper"
          extensions={extensions}
          theme={getTheme()}
          onChange={(val) => setContent(val)}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLineGutter: false,
            foldGutter: false,
            highlightSpecialChars: true,
            history: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            completionKeymap: true,
            tabSize: settings.tabSize || 4
          }}
        />
      </div>

      {/* Editor Bottom Status Bar */}
      <div className="editor-status-bar">
        <div className="status-counts">
          {settings.wordCount && <span>{stats.wordCount} words</span>}
          {settings.wordCount && settings.charCount && <span> &nbsp;·&nbsp; </span>}
          {settings.charCount && <span>{stats.charCount} characters</span>}
        </div>

        <div className="status-theme">
          <select 
            className="status-theme-select"
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
          >
            <option value="Default">Default</option>
            <option value="OneDark">One Dark</option>
            <option value="Light">Light</option>
          </select>
        </div>
      </div>
    </div>
  );
}
