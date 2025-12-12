
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
    DIALOGS, 
    FPS_DIALOGS, 
    MOBA_DIALOGS, 
    SOCIAL_DIALOGS, 
    BR_DIALOGS, 
    MMO_DIALOGS, 
    RTS_DIALOGS, 
    FIGHTING_DIALOGS,
    TF2_DIALOGS
} from './constants';
import { DialogNode, KeyboardShortcut, Preset } from './types';
import { DialogItem } from './components/DialogItem';
import { AIDialogWriter } from './components/AIDialogWriter';
import { ShareModal } from './components/ShareModal';
import { LoadModal } from './components/LoadModal';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { ArrowLeftIcon, SparklesIcon, PlusCircleIcon, RefreshCcwIcon, ShareIcon, UploadCloudIcon, ExternalLinkIcon, SettingsIcon } from './components/icons';
import { v4 as uuidv4 } from 'uuid';
import pako from 'pako';
import { decode as decodeFromArrow, ARROW_CHARS } from './utils/arrow-encoding';
import { decode as decodeFromSussy, SUSSY_CHARS_LIST } from './utils/sussy-encoding';

const BlockyChars = "▀▄█▌▐░▒▓";
const BlockyCharMap = new Map(BlockyChars.split('').map((c, i) => [c, i]));

const decodeFromBlocky = (encodedString: string): Uint8Array => {
  let bitBuffer = 0;
  let bitCount = 0;
  const bytes: number[] = [];

  for (const char of encodedString) {
    const value = BlockyCharMap.get(char);
    if (value === undefined) {
      continue; // Skip characters not in our alphabet (e.g., whitespace)
    }

    bitBuffer = (bitBuffer << 3) | value;
    bitCount += 3;

    while (bitCount >= 8) {
      bitCount -= 8;
      const byte = (bitBuffer >> bitCount) & 0xFF;
      bytes.push(byte);
    }
  }
  return new Uint8Array(bytes);
};

const decodeFromBase64 = (base64String: string): Uint8Array => {
  try {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Failed to decode Base64 string", e);
    throw new Error("Invalid Base64 string");
  }
};

const DEFAULT_SHORTCUT: KeyboardShortcut = {
    key: 'Backspace',
    shiftKey: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false
};

const isShortcutMatch = (e: KeyboardEvent, s: KeyboardShortcut) => {
    // Normalization for letters (e.g. 'a' vs 'A')
    const eventKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    const shortcutKey = s.key.length === 1 ? s.key.toUpperCase() : s.key;
    
    return (
        eventKey === shortcutKey &&
        e.ctrlKey === s.ctrlKey &&
        e.shiftKey === s.shiftKey &&
        e.altKey === s.altKey &&
        e.metaKey === s.metaKey
    );
};

function App() {
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
        const savedPresets = localStorage.getItem('gamer-presets');
        if (savedPresets) return JSON.parse(savedPresets);
        
        // Migration: Check for old 'gamer-dialogs'
        const savedOldDialogs = localStorage.getItem('gamer-dialogs');
        if (savedOldDialogs) {
             const initialDialogs = JSON.parse(savedOldDialogs);
             return [{ id: uuidv4(), name: 'Default Pack', dialogs: initialDialogs }];
        }

        // Default initialization with multiple packs
        return [
            { id: uuidv4(), name: 'FPS Tactical', dialogs: JSON.parse(JSON.stringify(FPS_DIALOGS)) },
            { id: uuidv4(), name: 'Battle Royale', dialogs: JSON.parse(JSON.stringify(BR_DIALOGS)) },
            { id: uuidv4(), name: 'MOBA Strategy', dialogs: JSON.parse(JSON.stringify(MOBA_DIALOGS)) },
            { id: uuidv4(), name: 'MMO Raid', dialogs: JSON.parse(JSON.stringify(MMO_DIALOGS)) },
            { id: uuidv4(), name: 'RTS Macro', dialogs: JSON.parse(JSON.stringify(RTS_DIALOGS)) },
            { id: uuidv4(), name: 'Fighting Games', dialogs: JSON.parse(JSON.stringify(FIGHTING_DIALOGS)) },
            { id: uuidv4(), name: 'Team Fortress 2', dialogs: JSON.parse(JSON.stringify(TF2_DIALOGS)) },
            { id: uuidv4(), name: 'Social / Chill', dialogs: JSON.parse(JSON.stringify(SOCIAL_DIALOGS)) }
        ];
    } catch (error) {
        console.error("Failed to parse saved presets/dialogs, using default.", error);
        return [{ id: uuidv4(), name: 'FPS Tactical', dialogs: JSON.parse(JSON.stringify(FPS_DIALOGS)) }];
    }
  });

  const [activePresetId, setActivePresetId] = useState<string>(() => {
      const savedId = localStorage.getItem('active-preset-id');
      if (savedId && presets.some(p => p.id === savedId)) return savedId;
      return presets[0].id;
  });

  const [activeCategory, setActiveCategory] = useState<DialogNode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<{ mode: 'add' | 'subdialog' | 'pack' | 'rewrite'; targetId?: string; targetText?: string; } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [pipShortcut, setPipShortcut] = useState<KeyboardShortcut>(() => {
      try {
          const saved = localStorage.getItem('pip-shortcut');
          return saved ? JSON.parse(saved) : DEFAULT_SHORTCUT;
      } catch {
          return DEFAULT_SHORTCUT;
      }
  });

  // PiP State
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // Derived state: current dialogs
  const activePreset = presets.find(p => p.id === activePresetId) || presets[0];
  const dialogs = activePreset.dialogs;

  useEffect(() => {
    try {
        localStorage.setItem('gamer-presets', JSON.stringify(presets));
        localStorage.setItem('active-preset-id', activePresetId);
    } catch (error) {
        console.error("Failed to save presets to localStorage", error);
    }
  }, [presets, activePresetId]);

  const showNotification = (message: string, isError = false) => {
    setNotification(message);
    setTimeout(() => setNotification(''), isError ? 4000 : 2500);
  };

  const handleCopy = useCallback((dialog: DialogNode) => {
    if (isEditing || !dialog.text) return;

    // Use the clipboard of the active window (PiP if open, else main)
    const targetWindow = pipWindow || window;
    const targetDoc = targetWindow.document;

    const onSuccess = () => {
        setCopiedId(dialog.id);
        showNotification(`Copied: "${dialog.text}"`);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const onFailure = () => {
        showNotification('Failed to copy! Window not focused.', true);
    };

    // Attempt 1: Async Clipboard API
    targetWindow.navigator.clipboard.writeText(dialog.text).then(onSuccess).catch(err => {
      console.warn('Clipboard API failed, attempting fallback...', err);

      // Attempt 2: document.execCommand fallback
      try {
        const textArea = targetDoc.createElement("textarea");
        textArea.value = dialog.text;
        
        // Ensure textarea is part of the DOM but invisible/unobtrusive
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        textArea.setAttribute("readonly", "");

        targetDoc.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = targetDoc.execCommand('copy');
        targetDoc.body.removeChild(textArea);
        
        if (successful) {
            onSuccess();
        } else {
            throw new Error("execCommand returned false");
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        onFailure();
      }
    });
  }, [isEditing, pipWindow]);

  const handleBack = useCallback(() => {
    setActiveCategory(null);
    setEditingNodeId(null);
  }, []);

  // Helper to update dialogs only for the active preset
  const setDialogsForCurrentPreset = (newDialogs: DialogNode[]) => {
      setPresets(prev => prev.map(p => p.id === activePresetId ? { ...p, dialogs: newDialogs } : p));
  };

  const updateDialogs = (newDialogs: DialogNode[]) => {
      // If we are deep inside a category, we need to reconstruct the tree from the top
      if (activeCategory) {
          const findUpdatedCategory = (nodes: DialogNode[]): DialogNode | null => {
              for (const node of nodes) {
                  if (node.id === activeCategory.id) return node;
                  if (node.children) {
                      const found = findUpdatedCategory(node.children);
                      if (found) return found;
                  }
              }
              return null;
          }
          const updatedCat = findUpdatedCategory(newDialogs);
          if (updatedCat) setActiveCategory(updatedCat);
      }
      setDialogsForCurrentPreset(newDialogs);
  };

  const recursiveHelper = (nodes: DialogNode[], logic: (node: DialogNode, parents: DialogNode[]) => DialogNode | null, parents: DialogNode[] = []): DialogNode[] => {
      const result: DialogNode[] = [];
      for (const node of nodes) {
          const newNode = logic(node, parents);
          if (newNode) {
              if (newNode.children) {
                  newNode.children = recursiveHelper(newNode.children, logic, [...parents, newNode]);
              }
              result.push(newNode);
          }
      }
      return result.map((n, i) => ({ ...n, key: (i + 1).toString() }));
  };

  const handleUpdate = (id: string, text: string) => {
      const updatedDialogs = recursiveHelper(dialogs, (node) => (node.id === id ? { ...node, text } : node));
      updateDialogs(updatedDialogs);
      setEditingNodeId(null);
  };

  const handleDelete = (id: string) => {
      const updatedDialogs = recursiveHelper(dialogs, (node) => (node.id === id ? null : node));
      updateDialogs(updatedDialogs);
  };

  const handleAdd = () => {
      const parentId = activeCategory ? activeCategory.id : null;
      const newId = uuidv4();
      const list = activeCategory ? activeCategory.children ?? [] : dialogs;
      const newNode: DialogNode = { id: newId, key: (list.length + 1).toString(), text: 'New Item', children: activeCategory?.children ? undefined : [] };

      if (!parentId) {
          updateDialogs([...dialogs, newNode]);
      } else {
          const updatedDialogs = recursiveHelper(dialogs, (node) => (node.id === parentId ? { ...node, children: [...(node.children ?? []), newNode] } : node));
          updateDialogs(updatedDialogs);
      }
      setEditingNodeId(newId);
  };
    
  const handleAiSave = (data: any) => {
    if (!aiConfig) return;

    if (aiConfig.mode === 'pack' && data?.dialogPack) {
        const newPack: DialogNode[] = data.dialogPack.map((scenario: any, i: number) => ({ // Level 1
            id: uuidv4(),
            key: (i + 1).toString(),
            text: scenario.scenario,
            children: (scenario.variants || []).map((variant: any, j: number) => ({ // Level 2
                id: uuidv4(),
                key: (j + 1).toString(),
                text: variant.variantName,
                children: (variant.dialogs || []).map((dialogText: string, k: number) => ({ // Level 3
                    id: uuidv4(),
                    key: (k + 1).toString(),
                    text: dialogText,
                }))
            }))
        }));

        let presetName = "AI Pack";
        if (data.theme) {
            presetName = data.theme.trim();
            if (presetName.length > 25) presetName = presetName.substring(0, 25) + '...';
        }
        
        const newPreset: Preset = {
            id: uuidv4(),
            name: presetName,
            dialogs: newPack
        };

        setPresets(prev => [...prev, newPreset]);
        setActivePresetId(newPreset.id);
        setActiveCategory(null);
        showNotification(`Added preset: ${presetName}`);
    } else if (aiConfig.mode === 'subdialog' && aiConfig.targetId) {
        updateDialogs(recursiveHelper(dialogs, (node) => (node.id === aiConfig.targetId ? { ...node, children: (data as string[]).map((text, i) => ({ id: uuidv4(), key: (i + 1).toString(), text })) } : node)));
    } else if (aiConfig.mode === 'rewrite' && aiConfig.targetId) {
        const newText = (data as string[])[0];
        if (newText) {
             handleUpdate(aiConfig.targetId, newText);
        }
    } else if (aiConfig.mode === 'add') {
        const text = (data as string[])[0];
        if (!text) return;
        const parentId = activeCategory ? activeCategory.id : null;
        const list = activeCategory ? activeCategory.children ?? [] : dialogs;
        const newNode: DialogNode = { id: uuidv4(), key: (list.length + 1).toString(), text, children: activeCategory?.children ? undefined : [] };
        if (!parentId) updateDialogs([...dialogs, newNode]);
        else updateDialogs(recursiveHelper(dialogs, (n) => (n.id === parentId ? { ...n, children: [...(n.children ?? []), newNode] } : n)));
    }
    setAiConfig(null);
  };

  const handleAddSubDialog = (id: string) => {
    const updatedDialogs = recursiveHelper(dialogs, (n) => (n.id === id && !n.children ? { ...n, children: [{ id: uuidv4(), key: '1', text: n.text }] } : n));
    const findNode = (nodes: DialogNode[], nodeId: string): DialogNode | null => nodes.reduce((acc: DialogNode | null, n) => acc || (n.id === nodeId ? n : (n.children ? findNode(n.children, nodeId) : null)), null);
    updateDialogs(updatedDialogs);
    setActiveCategory(findNode(updatedDialogs, id));
  };

  const handleGenerateSubDialogWithAI = (id: string) => {
      const findNode = (nodes: DialogNode[]): DialogNode | null => nodes.reduce((acc: DialogNode | null, n) => acc || (n.id === id ? n : (n.children ? findNode(n.children) : null)), null);
      const targetNode = findNode(dialogs);
      if (targetNode) setAiConfig({ mode: 'subdialog', targetId: id, targetText: targetNode.text });
  };
  
  const handleChangeTone = (id: string) => {
      const findNode = (nodes: DialogNode[]): DialogNode | null => nodes.reduce((acc: DialogNode | null, n) => acc || (n.id === id ? n : (n.children ? findNode(n.children) : null)), null);
      const targetNode = findNode(dialogs);
      if (targetNode) setAiConfig({ mode: 'rewrite', targetId: id, targetText: targetNode.text });
  };
  
  const handleReset = () => {
      if (window.confirm("Are you sure you want to reset the current preset to defaults?")) {
          // If the current preset name matches a template, reset to that template
          let defaultData = FPS_DIALOGS;
          const name = activePreset.name.toLowerCase();

          if (name.includes('moba')) defaultData = MOBA_DIALOGS;
          else if (name.includes('social')) defaultData = SOCIAL_DIALOGS;
          else if (name.includes('battle royale') || name.includes('br')) defaultData = BR_DIALOGS;
          else if (name.includes('mmo')) defaultData = MMO_DIALOGS;
          else if (name.includes('rts')) defaultData = RTS_DIALOGS;
          else if (name.includes('fighting')) defaultData = FIGHTING_DIALOGS;
          else if (name.includes('tf2') || name.includes('fortress')) defaultData = TF2_DIALOGS;
          
          setDialogsForCurrentPreset(JSON.parse(JSON.stringify(defaultData)));
          setActiveCategory(null);
          setIsEditing(false);
          showNotification("Current preset reset to defaults.");
      }
  };
  
  const handleLoadFromCode = (code: string) => {
    try {
      const trimmedCode = code.trim();
      if(!trimmedCode) throw new Error("Code is empty.");

      // Detect encoding type in order of most specific to most general
      const isBlocky = /^[▀▄█▌▐░▒▓\s]+$/.test(trimmedCode);
      const arrowCharRegex = new RegExp(`^[${ARROW_CHARS}\\s]+$`);
      const isArrow = arrowCharRegex.test(trimmedCode);
      const containsSussyChar = SUSSY_CHARS_LIST.some(c => trimmedCode.includes(c));
      const isBase64 = /^[A-Za-z0-9+/=\s]+$/.test(trimmedCode);

      let compressedBytes: Uint8Array;

      if (isBlocky) {
        compressedBytes = decodeFromBlocky(trimmedCode);
      } else if (isArrow) {
        compressedBytes = decodeFromArrow(trimmedCode);
      } else if (containsSussyChar) {
        try {
          compressedBytes = decodeFromSussy(trimmedCode);
        } catch (e: any) {
          throw new Error("Sussy code appears to be corrupted or invalid.");
        }
      } else if (isBase64) {
        compressedBytes = decodeFromBase64(trimmedCode);
      } else {
        throw new Error("Unknown code format. Please use a valid share code.");
      }
      
      const jsonString = pako.ungzip(compressedBytes, { to: 'string' });
      const newDialogs = JSON.parse(jsonString);
      
      if (!Array.isArray(newDialogs) || (newDialogs.length > 0 && typeof newDialogs[0].id === 'undefined')) {
        throw new Error("Invalid data structure.");
      }

      setDialogsForCurrentPreset(newDialogs);
      setActiveCategory(null);
      setShowLoadModal(false);
      showNotification("Dialogs loaded successfully!");
    } catch (error: any) {
      console.error("Failed to load from code:", error);
      showNotification(error.message || "Invalid or corrupted code. Please check and try again.", true);
    }
  };
  
  const saveShortcut = (shortcut: KeyboardShortcut) => {
      setPipShortcut(shortcut);
      localStorage.setItem('pip-shortcut', JSON.stringify(shortcut));
  };

  // --- Preset Management ---
  const handleSelectPreset = (id: string) => {
      setActivePresetId(id);
      setActiveCategory(null); // Reset navigation when switching
  };

  const handleCreatePreset = () => {
      const newPreset: Preset = {
          id: uuidv4(),
          name: 'New Preset',
          dialogs: []
      };
      setPresets([...presets, newPreset]);
      setActivePresetId(newPreset.id);
      setActiveCategory(null);
  };

  const handleDeletePreset = (id: string) => {
      if (presets.length <= 1) return;
      if (!window.confirm("Delete this preset?")) return;
      
      const newPresets = presets.filter(p => p.id !== id);
      setPresets(newPresets);
      if (activePresetId === id) {
          setActivePresetId(newPresets[0].id);
          setActiveCategory(null);
      }
  };

  const handleRenamePreset = (id: string, newName: string) => {
      setPresets(presets.map(p => p.id === id ? { ...p, name: newName } : p));
  };
  
  const togglePiP = useCallback(async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    // Helper functions for setup
    const copyStyles = (targetDoc: Document) => {
        // Copy standard stylesheets
        Array.from(document.styleSheets).forEach((styleSheet) => {
          try {
            // Try accessing rules (fails for cross-origin)
            const cssRules = Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
            const style = targetDoc.createElement('style');
            style.textContent = cssRules;
            targetDoc.head.appendChild(style);
          } catch (e) {
            // Fallback for cross-origin stylesheets (e.g. Google Fonts)
            if (styleSheet.href) {
                const link = targetDoc.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type;
                link.media = styleSheet.media?.mediaText || 'all';
                link.href = styleSheet.href;
                targetDoc.head.appendChild(link);
            }
          }
        });
        
        // Also copy any inline <style> tags that might be in head
        document.head.querySelectorAll('style').forEach(style => {
            if (style.textContent) {
                const newStyle = targetDoc.createElement('style');
                newStyle.textContent = style.textContent;
                targetDoc.head.appendChild(newStyle);
            }
        });
    };

    const setupBody = (targetDoc: Document) => {
        targetDoc.body.style.background = 'var(--color-bg-start)';
        targetDoc.body.style.display = 'flex';
        targetDoc.body.style.justifyContent = 'center';
        targetDoc.body.style.margin = '0';
        targetDoc.body.style.padding = '0'; 
        targetDoc.body.className = document.body.className;
    };

    // 1. Try Document PiP API (Preferred for Always-on-Top)
    let pip: Window | null = null;
    let errorMessage = '';

    if ('documentPictureInPicture' in window) {
         try {
            pip = await (window as any).documentPictureInPicture.requestWindow({
                width: 360,
                height: 500,
            });
         } catch (error: any) {
             errorMessage = error.message || "Unknown PiP Error";
             console.warn("PiP API Error:", error);
         }
    } else {
        errorMessage = "Not supported in this browser version";
    }

    if (pip) {
        // Success path for Always-on-Top
        try {
            copyStyles((pip as Window).document);
            setupBody((pip as Window).document);
            (pip as Window).addEventListener('pagehide', () => setPipWindow(null));
            setPipWindow(pip as Window);
            showNotification("Miniplayer Active (Always on Top)");
        } catch (styleError) {
            console.error("Error setting up PiP styles:", styleError);
            (pip as Window).close();
            showNotification("Failed to render Miniplayer.", true);
        }
        return;
    }

    // 2. Fallback to Popup Window
    // If we reached here, PiP failed. Notify user why if they might expect it to work.
    
    // Check if secure context
    if (!window.isSecureContext) {
        showNotification("Always-on-top requires HTTPS. Falling back to standard popup.", true);
    } else if (errorMessage) {
        showNotification(`Always-on-top failed: ${errorMessage}. Using fallback.`, true);
    } else {
        showNotification("Always-on-top not available. Falling back.", true);
    }

    try {
       const width = 360;
       const height = 500;
       const left = window.screen.width - width - 50;
       const top = 100;

       const popup = window.open('', 'Miniplayer', `width=${width},height=${height},left=${left},top=${top},popup=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`);
       if (!popup) throw new Error("Popup blocked");
       
       copyStyles(popup.document);
       setupBody(popup.document);

       const timer = setInterval(() => {
           if (popup.closed) {
               clearInterval(timer);
               setPipWindow(null);
           }
       }, 500);
       
       popup.addEventListener('beforeunload', () => setPipWindow(null));

       setPipWindow(popup);
    } catch (error) {
      console.error("Failed to open miniplayer", error);
      showNotification("Failed to open Miniplayer. Please check popup blocker.", true);
    }
  }, [pipWindow]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // 1. Ignore if typing in an input field (editingNodeId is set) or generic input
    if (editingNodeId || (event.target as HTMLElement).tagName === 'INPUT') return;
    
    // 2. Ignore if a modal is open
    if (aiConfig || showShareModal || showLoadModal || showSettingsModal) return;
    
    // 3. Check for Global PiP Shortcut (Allowed even in Edit mode)
    if (isShortcutMatch(event, pipShortcut)) {
        event.preventDefault();
        togglePiP();
        return;
    }

    // 4. If in Edit mode, stop here (don't trigger dialog actions)
    if (isEditing) return;

    // 5. Back action (Escape)
    if (event.key === 'Escape') {
      event.preventDefault();
      handleBack();
      return;
    }

    // 6. Dialog selection logic
    const listToSearch = activeCategory ? activeCategory.children : dialogs;
    const dialog = listToSearch?.find(d => d.key === event.key);
    if (dialog) {
      event.preventDefault();
      if (dialog.children) setActiveCategory(dialog);
      else handleCopy(dialog);
    }
  }, [activeCategory, handleCopy, handleBack, isEditing, editingNodeId, dialogs, aiConfig, showShareModal, showLoadModal, showSettingsModal, pipShortcut, togglePiP]);
  
  // Attach keypress listener to correct window
  useEffect(() => {
    const targetWindow = pipWindow || window;
    targetWindow.addEventListener('keydown', handleKeyPress);
    return () => targetWindow.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress, pipWindow]);

  const currentList = activeCategory ? activeCategory.children ?? [] : dialogs;
  const headerText = activeCategory ? activeCategory.text : activePreset.name;

  const getShortcutLabel = () => {
      let label = pipShortcut.key;
      if (label === ' ') label = 'Space';
      if (label.length === 1) label = label.toUpperCase();
      
      const parts = [];
      if(pipShortcut.ctrlKey) parts.push('Ctrl');
      if(pipShortcut.altKey) parts.push('Alt');
      if(pipShortcut.shiftKey) parts.push('Shift');
      if(pipShortcut.metaKey) parts.push('Meta');
      parts.push(label);
      return parts.join('+');
  }

  // The main App UI logic
  const AppContent = (
      <>
        <div className="app-container" style={pipWindow ? {height: '100vh', borderRadius: 0, border: 'none', maxWidth: '100%', padding: '16px'} : {}}>
        
        {/* Main Flex Wrapper: Sidebar + Content */}
        <div className="main-flex-wrapper" style={pipWindow ? {flexDirection: 'column', height: '100%'} : {}}>
            
            {/* Sidebar (Hidden in PiP usually, but logic below controls it) */}
            {!pipWindow && (
                <Sidebar 
                    presets={presets}
                    activePresetId={activePresetId}
                    onSelect={handleSelectPreset}
                    onCreate={handleCreatePreset}
                    onDelete={handleDeletePreset}
                    onRename={handleRenamePreset}
                />
            )}

            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <header className="app-header">
                    <h1 style={pipWindow ? { fontSize: '1.5rem', marginBottom: '8px' } : {}}>
                        {activeCategory && isEditing ? "Editing" : headerText}
                    </h1>
                    
                    {/* PiP Specific Preset Switcher */}
                    {pipWindow && (
                        <div style={{marginBottom: '12px'}}>
                            <select 
                                value={activePresetId} 
                                onChange={(e) => handleSelectPreset(e.target.value)}
                                style={{
                                    background: '#3d4a5d', color: '#fff', border: '1px solid #718096', 
                                    padding: '4px', borderRadius: '4px', maxWidth: '200px'
                                }}
                            >
                                {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="header-buttons">
                        {!pipWindow && <button onClick={() => setShowSettingsModal(true)} className="btn btn-slate" aria-label="Settings"><SettingsIcon className="icon" /></button>}
                        <button onClick={() => setIsEditing(!isEditing)} className="btn btn-slate">{isEditing ? 'Done' : 'Edit'}</button>
                        {!pipWindow && <button onClick={() => setShowShareModal(true)} className="btn btn-slate"><ShareIcon className="icon"/> Share</button>}
                        {!pipWindow && <button onClick={() => setShowLoadModal(true)} className="btn btn-slate"><UploadCloudIcon className="icon"/> Load</button>}
                        <button onClick={togglePiP} className="btn btn-blue" title={pipWindow ? "Return to main window" : `Open Miniplayer (${getShortcutLabel()})`}>
                            <ExternalLinkIcon className="icon" /> {pipWindow ? "Return" : "Miniplayer"}
                        </button>
                        {isEditing && !pipWindow && (
                            <>
                                <button onClick={() => setAiConfig({ mode: 'add'})} className="btn btn-purple"><SparklesIcon className="icon"/> AI Writer</button>
                                <button onClick={() => setAiConfig({ mode: 'pack'})} className="btn btn-indigo"><SparklesIcon className="icon"/> Pack</button>
                                <button onClick={handleReset} className="btn btn-red"><RefreshCcwIcon className="icon"/> Reset</button>
                            </>
                        )}
                    </div>
                </header>

                <main className="content-panel" style={pipWindow ? { overflowY: 'auto' } : {}}>
                {activeCategory && (
                    <button onClick={handleBack} className="back-button" aria-label="Go back">
                    <ArrowLeftIcon />
                    <span>Back</span>
                    </button>
                )}
                <div className="dialog-list">
                    {currentList.map((item) => (
                    <DialogItem
                        key={item.id}
                        dialog={item}
                        isCopied={copiedId === item.id}
                        onSelect={() => {
                        if (item.children) setActiveCategory(item);
                        else handleCopy(item);
                        }}
                        isCategory={item.children != null && item.children.length > 0}
                        isEditing={isEditing}
                        editingNodeId={editingNodeId}
                        onSetEditing={setEditingNodeId}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onAddSubDialog={handleAddSubDialog}
                        onGenerateSubDialogWithAI={handleGenerateSubDialogWithAI}
                        onChangeTone={handleChangeTone}
                    />
                    ))}
                    {isEditing && (
                    <button onClick={handleAdd} className="add-new-item-btn">
                        <PlusCircleIcon />
                        Add New Item
                    </button>
                    )}
                    {currentList.length === 0 && !isEditing && (
                        <div style={{textAlign: 'center', color: '#718096', padding: '20px'}}>
                            Empty preset. Click Edit to add items.
                        </div>
                    )}
                </div>
                </main>
            </div>
        </div>
      </div>
      
      {!pipWindow && (
          <footer className="app-footer">
              <p>Press <kbd className="kbd">Esc</kbd> to go back. Press <kbd className="kbd">{getShortcutLabel()}</kbd> for Miniplayer.</p>
          </footer>
      )}
      
      {aiConfig && <AIDialogWriter mode={aiConfig.mode} initialPrompt={aiConfig.mode === 'rewrite' ? '' : aiConfig.targetText} contextText={aiConfig.targetText} onSave={handleAiSave} onClose={() => setAiConfig(null)} />}
      {showShareModal && <ShareModal dialogs={dialogs} onClose={() => setShowShareModal(false)} />}
      {showLoadModal && <LoadModal onLoad={handleLoadFromCode} onClose={() => setShowLoadModal(false)} />}
      {showSettingsModal && <SettingsModal shortcut={pipShortcut} onSave={saveShortcut} onClose={() => setShowSettingsModal(false)} />}

      {notification && (
        <div className={`notification-bubble ${notification.includes('Failed') || notification.includes('failed') || notification.includes('not available') || notification.includes('required') ? 'notification-error' : 'notification-success'}`} style={pipWindow ? {position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: 'max-content'} : {}}>
          {notification}
        </div>
      )}
    </>
  );
  
  return (
      <>
        {pipWindow ? (
            // When in PiP, render a placeholder in the main window
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#fff', gap: '16px' }}>
                <div style={{fontSize: '3rem'}}>🚀</div>
                <h2>Running in Miniplayer</h2>
                <p>The app is currently active in a separate, always-on-top window.</p>
                <button onClick={togglePiP} className="btn btn-blue">Bring Back to Tab</button>
            </div>
        ) : (
            // Normal render
            AppContent
        )}

        {/* Portal content to PiP window if active */}
        {pipWindow && ReactDOM.createPortal(AppContent, pipWindow.document.body)}
      </>
  );
}

export default App;
