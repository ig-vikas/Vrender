import React from 'react';
import { X, Sliders, Code2 } from 'lucide-react';

export default function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  setSettings,
  customCSS,
  setCustomCSS
}) {
  if (!isOpen) return null;

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className={`drawer right-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <Sliders size={18} color="#10a37f" />
            <span>Settings</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Auto Save Toggle */}
          <div className="setting-row">
            <span className="setting-label">Auto Save</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.autoSave} 
                onChange={() => handleToggle('autoSave')} 
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Word Count Toggle */}
          <div className="setting-row">
            <span className="setting-label">Word Count</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.wordCount} 
                onChange={() => handleToggle('wordCount')} 
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Character Count Toggle */}
          <div className="setting-row">
            <span className="setting-label">Character Count</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.charCount} 
                onChange={() => handleToggle('charCount')} 
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Night Mode Toggle */}
          <div className="setting-row">
            <span className="setting-label">ChatGPT Dark Mode</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.nightMode} 
                onChange={() => handleToggle('nightMode')} 
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Scroll Sync Toggle */}
          <div className="setting-row">
            <span className="setting-label">Scroll Sync</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.scrollSync} 
                onChange={() => handleToggle('scrollSync')} 
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Tab Size Dropdown */}
          <div className="setting-row">
            <span className="setting-label">Tab Size</span>
            <select 
              className="setting-select"
              value={settings.tabSize}
              onChange={(e) => handleChange('tabSize', Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>

          {/* Keybindings Dropdown */}
          <div className="setting-row">
            <span className="setting-label">Keybindings</span>
            <select 
              className="setting-select"
              value={settings.keybindings}
              onChange={(e) => handleChange('keybindings', e.target.value)}
            >
              <option value="Default">Default</option>
              <option value="Vim">Vim</option>
              <option value="Emacs">Emacs</option>
            </select>
          </div>

          {/* Custom Document CSS Section */}
          <div className="drawer-section" style={{ marginTop: '24px' }}>
            <div className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code2 size={14} color="#10a37f" />
              <span>Custom Document CSS</span>
            </div>
            <p style={{ fontSize: '12px', color: '#8e8e93', marginBottom: '8px' }}>
              Write custom CSS to style the rendered document preview live:
            </p>
            <textarea
              className="custom-css-textarea"
              placeholder="/* Add custom document styles here */&#10;.markdown-body h3 { color: #3cb371; }&#10;.chatgpt-code-wrapper { border-color: #10a37f; }"
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
