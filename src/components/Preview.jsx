import React, { useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';

// Configure marked with a custom renderer for ChatGPT-style output
// marked v18+ uses token objects in renderer methods
const renderer = {
  code({ text, lang }) {
    const code = text || '';
    const language = lang || '';
    const validLang = language && hljs.getLanguage(language) ? language : '';
    let highlighted = '';
    try {
      if (validLang) {
        highlighted = hljs.highlight(code, { language: validLang }).value;
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
    } catch (e) {
      highlighted = code;
    }

    const langLabel = validLang
      ? validLang.charAt(0).toUpperCase() + validLang.slice(1)
      : language
        ? language.charAt(0).toUpperCase() + language.slice(1)
        : 'Code';

    return `<div class="chatgpt-code-block">
      <div class="chatgpt-code-header">
        <span class="chatgpt-code-lang">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          ${langLabel}
        </span>
        <button class="chatgpt-copy-btn" data-code="${encodeURIComponent(code)}" title="Copy code">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div class="chatgpt-code-body"><pre><code class="hljs ${validLang}">${highlighted}</code></pre></div>
    </div>`;
  },

  blockquote({ tokens }) {
    // We need to parse inner tokens using the parser
    const body = this.parser.parse(tokens);
    return `<blockquote class="chatgpt-blockquote">${body}</blockquote>`;
  },

  table({ header, rows }) {
    // Build ChatGPT-style table with copy button
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

    return `<div class="chatgpt-table-wrapper">
      <div class="chatgpt-table-header-bar">
        <button class="chatgpt-copy-btn chatgpt-table-copy" title="Copy table">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <table>${headerHtml}${bodyHtml}</table>
    </div>`;
  },

  codespan({ text }) {
    return `<code class="chatgpt-inline-code">${text}</code>`;
  }
};

marked.use({ renderer, gfm: true, breaks: true });

export default function Preview({ content, previewRef, onScroll, settings, customCSS }) {
  const containerRef = useRef(null);

  // Pre-process math expressions and orphaned reference links before marked
  const processedContent = useMemo(() => {
    if (!content) return '';
    let text = content;

    // --- Convert orphaned reference-style link definitions into visible links ---
    // Pattern: [id]: URL "optional title"  or  [id]: URL
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

    if (refDefs.length > 0) {
      // Check which reference IDs are actually used in the text as [text][id] or [id]
      const usedIds = new Set();
      for (const def of refDefs) {
        // Match [text][id] or [id] (but not the definition line itself)
        const useRegex = new RegExp(
          `\\[([^\\]]*?)\\]\\[${def.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]|` +
          `(?<!:\\s*)\\[${def.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\](?!\\s*:)`,
          'gm'
        );
        // Check usage outside of definition lines
        const textWithoutDefs = text.replace(refDefRegex, '');
        if (useRegex.test(textWithoutDefs)) {
          usedIds.add(def.id);
        }
      }

      // Convert orphaned (unused) definitions into visible links
      const orphaned = refDefs.filter(d => !usedIds.has(d.id));
      if (orphaned.length > 0) {
        for (const def of orphaned) {
          const label = def.title || def.url;
          const replacement = `[\\[${def.id}\\] ${label}](${def.url})`;
          text = text.replace(def.full, replacement);
        }
      }
    }

    // Replace block math $$...$$ (must come first)
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
  }, [content]);

  // Render markdown to HTML
  const htmlContent = useMemo(() => {
    try {
      return marked.parse(processedContent || '');
    } catch (err) {
      return `<p style="color:#ef4444;">Error rendering: ${err.message}</p>`;
    }
  }, [processedContent]);

  // Attach copy button listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const handleCopy = (e) => {
      const btn = e.currentTarget;
      const rawCode = btn.getAttribute('data-code');
      if (rawCode) {
        navigator.clipboard.writeText(decodeURIComponent(rawCode)).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '<span style="font-size:11px;color:#10a37f;font-weight:600;">Copied!</span>';
          setTimeout(() => { btn.innerHTML = orig; }, 2000);
        });
      }
    };

    // Table copy - copy table text content
    const handleTableCopy = (e) => {
      const btn = e.currentTarget;
      const wrapper = btn.closest('.chatgpt-table-wrapper');
      if (wrapper) {
        const table = wrapper.querySelector('table');
        if (table) {
          navigator.clipboard.writeText(table.innerText).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '<span style="font-size:11px;color:#10a37f;font-weight:600;">Copied!</span>';
            setTimeout(() => { btn.innerHTML = orig; }, 2000);
          });
        }
      }
    };

    const codeBtns = containerRef.current.querySelectorAll('.chatgpt-copy-btn[data-code]');
    codeBtns.forEach((btn) => btn.addEventListener('click', handleCopy));

    const tableBtns = containerRef.current.querySelectorAll('.chatgpt-table-copy');
    tableBtns.forEach((btn) => btn.addEventListener('click', handleTableCopy));

    return () => {
      codeBtns.forEach((btn) => btn.removeEventListener('click', handleCopy));
      tableBtns.forEach((btn) => btn.removeEventListener('click', handleTableCopy));
    };
  }, [htmlContent]);

  return (
    <div
      className="preview-container chatgpt-preview"
      ref={(node) => {
        containerRef.current = node;
        if (previewRef) previewRef.current = node;
      }}
      onScroll={(e) => {
        if (onScroll && settings.scrollSync) {
          onScroll(e);
        }
      }}
    >
      {customCSS && <style>{customCSS}</style>}
      <div className="chatgpt-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
