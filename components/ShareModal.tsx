
import React, { useState, useEffect } from 'react';
import pako from 'pako';
import { DialogNode } from '../types';
import { XIcon, ClipboardIcon, CheckIcon } from './icons';
import { encode as encodeToArrow } from '../utils/arrow-encoding';

// Encoders are now self-contained within the modal
const BlockyChars = "▀▄█▌▐░▒▓";

const encodeToBlocky = (uint8Array: Uint8Array): string => {
  let bitBuffer = 0;
  let bitCount = 0;
  let result = '';

  for (const byte of uint8Array) {
    bitBuffer = (bitBuffer << 8) | byte;
    bitCount += 8;
    while (bitCount >= 3) {
      bitCount -= 3;
      const chunk = (bitBuffer >> bitCount) & 0b111;
      result += BlockyChars[chunk];
    }
  }
  if (bitCount > 0) {
    const chunk = (bitBuffer << (3 - bitCount)) & 0b111;
    result += BlockyChars[chunk];
  }
  return result;
};

const encodeToBase64 = (uint8Array: Uint8Array): string => {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

interface ShareModalProps {
  dialogs: DialogNode[];
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ dialogs, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [encodingType, setEncodingType] = useState<'blocky' | 'standard' | 'arrow'>('blocky');
  const [code, setCode] = useState('');

  useEffect(() => {
    try {
      const jsonString = JSON.stringify(dialogs);
      const compressed = pako.gzip(jsonString);
      
      if (encodingType === 'blocky') {
        setCode(encodeToBlocky(compressed));
      } else if (encodingType === 'arrow') {
        setCode(encodeToArrow(compressed));
      } else {
        setCode(encodeToBase64(compressed));
      }
    } catch (error) {
      console.error("Failed to generate share code:", error);
      setCode("Error generating code.");
    }
  }, [dialogs, encodingType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
            <h2>Share Your Dialog Pack</h2>
            <button onClick={onClose} className="close-btn" aria-label="Close">
                <XIcon className="icon"/>
            </button>
        </header>
        <div className="modal-content">
            <p>Copy this code to save or share your custom dialog setup. Choose your preferred format below.</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                onClick={() => setEncodingType('blocky')}
                className={`btn ${encodingType === 'blocky' ? 'btn-indigo' : 'btn-slate'}`}
                style={{ flex: 1 }}
                aria-pressed={encodingType === 'blocky'}
              >
                Blocky Code
              </button>
              <button
                onClick={() => setEncodingType('arrow')}
                className={`btn ${encodingType === 'arrow' ? 'btn-indigo' : 'btn-slate'}`}
                style={{ flex: 1 }}
                aria-pressed={encodingType === 'arrow'}
              >
                Arrow Code
              </button>
              <button
                onClick={() => setEncodingType('standard')}
                className={`btn ${encodingType === 'standard' ? 'btn-indigo' : 'btn-slate'}`}
                style={{ flex: 1 }}
                aria-pressed={encodingType === 'standard'}
              >
                Standard (Base64)
              </button>
            </div>
            
            <textarea
              readOnly
              value={code}
              className="textarea-inset"
              aria-label="Shareable code"
            />

            <button
              onClick={handleCopy}
              className="btn btn-blue"
              style={{width: '100%'}}
            >
              {isCopied ? <CheckIcon className="icon"/> : <ClipboardIcon className="icon"/>}
              {isCopied ? 'Copied!' : 'Copy Code'}
            </button>
        </div>
      </div>
    </div>
  );
};
