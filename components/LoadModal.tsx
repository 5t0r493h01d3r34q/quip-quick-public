import React, { useState } from 'react';
import { XIcon, UploadCloudIcon } from './icons';

interface LoadModalProps {
  onLoad: (code: string) => void;
  onClose: () => void;
}

export const LoadModal: React.FC<LoadModalProps> = ({ onLoad, onClose }) => {
  const [code, setCode] = useState('');

  const handleLoad = () => {
    if (code.trim()) {
      onLoad(code);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
         <header className="modal-header">
            <h2>Load Dialog Pack</h2>
            <button onClick={onClose} className="close-btn" aria-label="Close">
                <XIcon className="icon"/>
            </button>
        </header>
        <div className="modal-content">
            <p>Paste a code below to load a previously saved dialog setup. This will replace your current configuration.</p>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your share code here..."
              className="textarea-inset"
              aria-label="Paste code here"
            />

            <button
              onClick={handleLoad}
              disabled={!code.trim()}
              className="btn btn-purple"
              style={{width: '100%'}}
            >
              <UploadCloudIcon className="icon"/>
              Load Pack
            </button>
        </div>
      </div>
    </div>
  );
};
