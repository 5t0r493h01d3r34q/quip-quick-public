import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';
import { KeyboardShortcut } from '../types';

interface SettingsModalProps {
  shortcut: KeyboardShortcut;
  onSave: (shortcut: KeyboardShortcut) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ shortcut, onSave, onClose }) => {
  const [currentShortcut, setCurrentShortcut] = useState<KeyboardShortcut>(shortcut);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore if only modifiers are pressed
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      const newShortcut: KeyboardShortcut = {
        key: e.key.length === 1 ? e.key.toUpperCase() : e.key,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      };

      setCurrentShortcut(newShortcut);
      setIsRecording(false);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isRecording]);

  const formatShortcut = (s: KeyboardShortcut) => {
    const parts = [];
    if (s.ctrlKey) parts.push('Ctrl');
    if (s.altKey) parts.push('Alt');
    if (s.shiftKey) parts.push('Shift');
    if (s.metaKey) parts.push('Meta');
    
    let label = s.key;
    if (label === ' ') label = 'Space';
    
    parts.push(label);
    return parts.join(' + ');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
         <header className="modal-header">
            <h2>Settings</h2>
            <button onClick={onClose} className="close-btn" aria-label="Close">
                <XIcon className="icon"/>
            </button>
        </header>
        <div className="modal-content">
            <h3>Keyboard Shortcuts</h3>
            
            <div className="input-inset" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>Toggle Miniplayer</span>
                <button 
                    className={`btn ${isRecording ? 'btn-red' : 'btn-slate'}`}
                    onClick={() => setIsRecording(true)}
                >
                    {isRecording ? 'Press keys...' : formatShortcut(currentShortcut)}
                </button>
            </div>
            {isRecording && <p style={{fontSize: '0.8rem', color: '#718096', marginTop: '8px', textAlign: 'center'}}>Press the desired key combination.</p>}

            <div style={{marginTop: 'auto', paddingTop: '16px'}}>
                 <button
                  onClick={() => { onSave(currentShortcut); onClose(); }}
                  className="btn btn-blue"
                  style={{width: '100%'}}
                >
                  Save Settings
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};