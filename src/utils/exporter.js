import { marked, Marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';

/**
 * Downloads a file to the user's computer
 */
const downloadFile = (filename, content, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Delay cleanup to ensure browser captures the 'download' attribute filename
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
};

/**
 * Export document as Markdown (.md)
 */
export const exportMarkdown = (title, markdownContent) => {
  const filename = `${title || 'document'}.md`;
  downloadFile(filename, markdownContent, 'text/markdown;charset=utf-8');
};

/**
 * Convert orphaned reference-style link definitions into visible inline links.
 * e.g. [1]: https://example.com "Title" → [[1] Title](https://example.com)
 */
const preprocessReferenceLinks = (text) => {
  const refDefRegex = /^\s{0,3}\[([^\]]+)\]:\s+(\S+)(?:\s+"([^"]*)")?\s*$/gm;
  const refDefs = [];
  let defMatch;
  while ((defMatch = refDefRegex.exec(text)) !== null) {
    refDefs.push({
      full: defMatch[0],
      id: defMatch[1],
      url: defMatch[2],
      title: defMatch[3] || ''
    });
  }

  if (refDefs.length === 0) return text;

  // Check which reference IDs are actually used in the text as [text][id] or [id]
  const usedIds = new Set();
  const textWithoutDefs = text.replace(refDefRegex, '');
  for (const def of refDefs) {
    const escapedId = def.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const useRegex = new RegExp(
      `\\[([^\\]]*?)\\]\\[${escapedId}\\]|` +
      `(?<!:\\s*)\\[${escapedId}\\](?!\\s*:)`,
      'gm'
    );
    if (useRegex.test(textWithoutDefs)) {
      usedIds.add(def.id);
    }
  }

  // Convert orphaned (unused) definitions into visible links
  const orphaned = refDefs.filter(d => !usedIds.has(d.id));
  for (const def of orphaned) {
    const label = def.title || def.url;
    const replacement = `[\\[${def.id}\\] ${label}](${def.url})`;
    text = text.replace(def.full, replacement);
  }

  return text;
};

/**
 * Preprocess markdown content: resolve orphaned reference links + render KaTeX math
 */
const preprocessMarkdown = (content) => {
  let text = content || '';

  // Convert orphaned reference-style link definitions into visible links
  text = preprocessReferenceLinks(text);

  // Replace block math $$...$$
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    try {
      return `<div class="chatgpt-math-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  // Replace inline math $...$
  text = text.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    try {
      return `<span class="chatgpt-math-inline">${katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })}</span>`;
    } catch (e) {
      return match;
    }
  });

  return text;
};

/**
 * Export document as Raw HTML (.html)
 */
export const exportRawHTML = (title, markdownContent) => {
  const filename = `${title || 'document'}.html`;
  const processed = preprocessMarkdown(markdownContent);
  const rawHtml = marked.parse(processed);
  downloadFile(filename, rawHtml, 'text/html;charset=utf-8');
};

/**
 * Custom renderer for styled HTML export — adds line numbers + copy button to code blocks (can omit for PDF)
 */
const buildExportRenderer = (isPdf = false) => {
  return {
    code({ text, lang }) {
      const code = text || '';
      const language = lang || '';
      const validLang = language && hljs.getLanguage(language) ? language : '';
      let highlighted = '';
      try {
        highlighted = validLang
          ? hljs.highlight(code, { language: validLang }).value
          : hljs.highlightAuto(code).value;
      } catch (e) {
        highlighted = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }

      const langLabel = validLang
        ? validLang.charAt(0).toUpperCase() + validLang.slice(1)
        : language
          ? language.charAt(0).toUpperCase() + language.slice(1)
          : 'Code';

      if (isPdf) {
        return `<div class="code-block">
          <div class="code-header">
            <span class="code-lang">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              ${langLabel}
            </span>
          </div>
          <div class="code-body">
            <pre class="code-content"><code class="hljs ${validLang}">${highlighted}</code></pre>
          </div>
        </div>`;
      }

      // Styled HTML export (with copy button, no line numbers)
      const escapedCode = code.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `<div class="code-block">
        <div class="code-header">
          <span class="code-lang">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            ${langLabel}
          </span>
          <button class="copy-btn" onclick="copyCode(this)" data-code="${escapedCode}" title="Copy code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span class="copy-text">Copy</span>
          </button>
        </div>
        <div class="code-body">
          <pre class="code-content"><code class="hljs ${validLang}">${highlighted}</code></pre>
        </div>
      </div>`;
    },

    codespan({ text }) {
      return `<code class="inline-code">${text}</code>`;
    },

    blockquote({ tokens }) {
      const body = this.parser.parse(tokens);
      return `<blockquote class="styled-blockquote">${body}</blockquote>`;
    },

    table({ header, rows }) {
      let headerHtml = '<thead><tr>';
      for (const cell of header) {
        const align = cell.align ? ` style="text-align:${cell.align}"` : '';
        headerHtml += `<th${align}>${this.parser.parseInline(cell.tokens)}</th>`;
      }
      headerHtml += '</tr></thead>';

      let bodyHtml = '<tbody>';
      for (const row of rows) {
        bodyHtml += '<tr>';
        for (const cell of row) {
          const align = cell.align ? ` style="text-align:${cell.align}"` : '';
          bodyHtml += `<td${align}>${this.parser.parseInline(cell.tokens)}</td>`;
        }
        bodyHtml += '</tr>';
      }
      bodyHtml += '</tbody>';

      return `<div class="table-wrapper"><table>${headerHtml}${bodyHtml}</table></div>`;
    }
  };
};

/**
 * The full embedded CSS for the exported styled HTML
 */
const EXPORT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0d0d0d; color: #ececec;
  max-width: 860px; margin: 0 auto;
  padding: 40px 32px 80px; line-height: 1.7;
}

/* Headings */
h1, h2, h3, h4, h5, h6 { color: #fff; font-weight: 600; margin: 32px 0 12px; }
h1 { font-size: 2em; border-bottom: 1px solid #262626; padding-bottom: 10px; }
h2 { font-size: 1.55em; border-bottom: 1px solid #262626; padding-bottom: 8px; }
h3 { font-size: 1.25em; }
h4 { font-size: 1.1em; }

/* Paragraphs & text */
p { margin-bottom: 14px; color: #d1d5db; }
a { color: #10a37f; text-decoration: none; }
a:hover { text-decoration: underline; }
strong { color: #fff; }
img { max-width: 100%; border-radius: 8px; margin: 12px 0; }

/* Lists */
ul, ol { padding-left: 24px; margin-bottom: 14px; color: #d1d5db; }
li { margin-bottom: 5px; }
li::marker { color: #8e8e93; }

/* Horizontal rule */
hr { border: none; height: 1px; background: #262626; margin: 32px 0; }

/* ===== CODE BLOCKS with line numbers & copy ===== */
.code-block {
  background: #1e1e1e; border-radius: 12px;
  margin: 20px 0; overflow: hidden;
  border: 1px solid #333;
}
.code-header {
  background: #2b2b2b; padding: 8px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #333;
}
.code-lang {
  font-size: 12px; font-weight: 600; color: #b4b4b4;
  display: flex; align-items: center; gap: 6px;
  font-family: 'Fira Code', monospace;
}
.copy-btn {
  background: transparent; border: 1px solid #444;
  color: #999; cursor: pointer;
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 5px;
  font-size: 11px; font-family: 'Inter', sans-serif;
  transition: all 0.15s;
}
.copy-btn:hover { background: #3a3a3a; color: #fff; border-color: #666; }
.copy-btn.copied { border-color: #10a37f; color: #10a37f; }
.copy-text { font-weight: 500; }

.code-body {
  display: flex; overflow-x: auto;
}
.code-content {
  flex: 1; padding: 16px 18px; margin: 0;
  overflow-x: auto; background: transparent;
}
.code-content code {
  font-family: 'Fira Code', Consolas, monospace;
  font-size: 13.5px; line-height: 1.55;
  background: transparent; color: #d4d4d4;
}

/* Syntax highlighting (VS Code Dark+) */
.hljs-keyword { color: #c586c0; }
.hljs-built_in, .hljs-type { color: #4ec9b0; }
.hljs-string { color: #ce9178; }
.hljs-number { color: #b5cea8; }
.hljs-comment { color: #6a9955; font-style: italic; }
.hljs-function, .hljs-title { color: #dcdcaa; }
.hljs-attr, .hljs-property, .hljs-variable { color: #9cdcfe; }
.hljs-params { color: #d4d4d4; }
.hljs-literal, .hljs-meta { color: #569cd6; }

/* Inline code */
.inline-code {
  background: #262626; color: #e5e5e5;
  padding: 2px 8px; border-radius: 5px;
  font-family: 'Fira Code', monospace;
  font-size: 13px; border: 1px solid #333;
}

/* Blockquotes */
.styled-blockquote {
  padding: 12px 18px; margin: 18px 0;
  border-left: 3px solid #10a37f;
  background: #171717; border-radius: 0 8px 8px 0;
  color: #d1d5db;
}
.styled-blockquote p { margin-bottom: 4px; }

/* Tables */
.table-wrapper { margin: 18px 0; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td {
  padding: 10px 16px; text-align: left;
  border-bottom: 1px solid #262626;
  color: #ececec; font-size: 14px;
}
th { font-weight: 600; color: #fff; border-bottom: 1px solid #444; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #0d0d0d; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #555; }

@media (max-width: 767px) {
  body { padding: 20px 16px 60px; }
}
`;

/**
 * JavaScript for copy button functionality in exported HTML
 */
const EXPORT_JS = `
function copyCode(btn) {
  var code = btn.getAttribute('data-code');
  // Decode HTML entities
  var txt = document.createElement('textarea');
  txt.innerHTML = code;
  var decoded = txt.value;

  navigator.clipboard.writeText(decoded).then(function() {
    btn.classList.add('copied');
    var textEl = btn.querySelector('.copy-text');
    var orig = textEl.textContent;
    textEl.textContent = 'Copied!';
    setTimeout(function() {
      btn.classList.remove('copied');
      textEl.textContent = orig;
    }, 2000);
  }).catch(function() {
    // Fallback for older browsers
    var ta = document.createElement('textarea');
    ta.value = decoded;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.classList.add('copied');
    var textEl = btn.querySelector('.copy-text');
    var orig = textEl.textContent;
    textEl.textContent = 'Copied!';
    setTimeout(function() {
      btn.classList.remove('copied');
      textEl.textContent = orig;
    }, 2000);
  });
}
`;

/**
 * Create a fresh Marked instance with export renderer
 */
const createExportMarked = (isPdf = false) => {
  const m = new Marked();
  m.use({ renderer: buildExportRenderer(isPdf), gfm: true, breaks: true });
  return m;
};

/**
 * Export document as Styled HTML (.html) with line numbers, copy buttons, and full dark theme
 */
export const exportStyledHTML = (title, markdownContent) => {
  const filename = `${title || 'document'}_styled.html`;
  const exportMarked = createExportMarked(false);
  const processed = preprocessMarkdown(markdownContent);
  const rawHtml = exportMarked.parse(processed);

  const fullDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Vrender Document'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>${EXPORT_CSS}</style>
</head>
<body>
  ${rawHtml}
  <script>${EXPORT_JS}<\/script>
</body>
</html>`;

  downloadFile(filename, fullDocument, 'text/html;charset=utf-8');
};

/**
 * Map highlight.js CSS classes to inline styles for pdfmake (GitHub Light palette)
 */
const HLJS_STYLE_MAP = {
  'hljs-keyword': 'color:#cf222e;',
  'hljs-built_in': 'color:#0550ae;',
  'hljs-type': 'color:#0550ae;',
  'hljs-string': 'color:#0a3069;',
  'hljs-number': 'color:#0550ae;',
  'hljs-comment': 'color:#6e7781;font-style:italic;',
  'hljs-function': 'color:#8250df;',
  'hljs-title': 'color:#8250df;',
  'hljs-attr': 'color:#953800;',
  'hljs-property': 'color:#953800;',
  'hljs-variable': 'color:#953800;',
  'hljs-params': 'color:#24292f;',
  'hljs-literal': 'color:#0550ae;',
  'hljs-meta': 'color:#0550ae;',
  'hljs-regexp': 'color:#0a3069;',
  'hljs-selector-tag': 'color:#cf222e;',
  'hljs-selector-class': 'color:#953800;',
  'hljs-selector-id': 'color:#0550ae;',
  'hljs-tag': 'color:#cf222e;',
  'hljs-name': 'color:#cf222e;',
  'hljs-symbol': 'color:#0550ae;',
  'hljs-addition': 'color:#116329;',
  'hljs-deletion': 'color:#82071e;',
};

/**
 * Convert hljs class="..." attributes to inline style="..." for pdfmake compatibility
 */
const convertHljsToInline = (html) => {
  return html.replace(/class="([^"]*?)"/g, (match, classes) => {
    const styles = classes.split(/\s+/)
      .map(cls => HLJS_STYLE_MAP[cls])
      .filter(Boolean)
      .join('');
    return styles ? `style="${styles}"` : match;
  });
};

/**
 * Export document as PDF using pdfmake — direct download, real text, lightweight.
 * Markdown → HTML → pdfmake document → .pdf download
 * No print dialog. File goes straight to the browser's downloads folder.
 */
export const exportPDF = async (title, markdownContent) => {
  // Dynamic imports — only loaded when user clicks "Export PDF" (~1.5MB, cached after first load)
  const [pdfMakeModule, pdfFontsModule, htmlToPdfmakeModule] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
    import('html-to-pdfmake'),
  ]);

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;
  const htmlToPdfmake = htmlToPdfmakeModule.default || htmlToPdfmakeModule;

  // Register fonts — handle both old and new pdfmake APIs
  if (typeof pdfMake.addVirtualFileSystem === 'function') {
    pdfMake.addVirtualFileSystem(pdfFonts);
  } else if (pdfFonts?.pdfMake?.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else {
    pdfMake.vfs = pdfFonts;
  }

  // --- Parse markdown → HTML with inline styles for PDF ---
  const exportMarked = createExportMarked(true); // isPdf=true
  const processed = preprocessMarkdown(markdownContent);
  let rawHtml = exportMarked.parse(processed);

  // Convert hljs class-based syntax colors to inline styles (pdfmake needs inline styles)
  rawHtml = convertHljsToInline(rawHtml);

  // --- Convert HTML → pdfmake content ---
  const content = htmlToPdfmake(rawHtml, {
    tableAutoSize: true,
    defaultStyles: {
      b: { bold: true },
      strong: { bold: true },
      i: { italics: true },
      em: { italics: true },
      u: { decoration: 'underline' },
      s: { decoration: 'lineThrough' },
      a: { color: '#0969da', decoration: 'underline' },
      h1: { fontSize: 24, bold: true, marginBottom: 8, marginTop: 24, color: '#1b1f24' },
      h2: { fontSize: 20, bold: true, marginBottom: 6, marginTop: 20, color: '#1b1f24' },
      h3: { fontSize: 16, bold: true, marginBottom: 6, marginTop: 16, color: '#1b1f24' },
      h4: { fontSize: 14, bold: true, marginBottom: 4, marginTop: 14, color: '#1b1f24' },
      h5: { fontSize: 13, bold: true, marginBottom: 4, marginTop: 12, color: '#1b1f24' },
      h6: { fontSize: 12, bold: true, marginBottom: 4, marginTop: 10, color: '#656d76' },
      p: { margin: [0, 0, 0, 8] },
      li: { marginBottom: 2 },
      th: { bold: true, fillColor: '#f6f8fa', color: '#1b1f24', fontSize: 11 },
      td: { fontSize: 11, color: '#1f2328' },
      pre: { 
        fontSize: 10, 
        background: '#f6f8fa', 
        fillColor: '#f6f8fa',
        margin: [0, 6, 0, 6],
        preserveLeadingSpaces: true
      },
      code: {
        fontSize: 10,
        color: '#1f2328',
      },
      blockquote: { 
        margin: [0, 6, 0, 6],
        italics: true,
        color: '#57606a',
      },
      img: { margin: [0, 6, 0, 6] },
    }
  });

  // --- Build pdfmake document definition ---
  const docDefinition = {
    content: content,
    defaultStyle: {
      fontSize: 12,
      lineHeight: 1.45,
      color: '#24292f',
    },
    styles: {
      'html-code': {
        fontSize: 10,
        background: '#f6f8fa',
        color: '#1f2328',
      },
      'html-pre': {
        fontSize: 10,
        background: '#f6f8fa',
        fillColor: '#f6f8fa',
        margin: [0, 8, 0, 8],
        preserveLeadingSpaces: true,
      },
      'html-a': {
        color: '#0969da',
        decoration: 'underline',
      },
      'html-blockquote': {
        margin: [12, 6, 0, 6],
        italics: true,
        color: '#57606a',
      },
    },
    pageSize: 'A4',
    pageMargins: [56, 50, 56, 60],

    // Footer with page numbers
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      color: '#8b949e',
      margin: [0, 20, 0, 0],
    }),
  };

  // --- Generate and download the PDF ---
  pdfMake.createPdf(docDefinition).download(`${title || 'document'}.pdf`);
};

