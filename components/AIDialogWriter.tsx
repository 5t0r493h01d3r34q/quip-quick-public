
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon, XIcon, WandIcon } from './icons';

interface AIDialogWriterProps {
  mode: 'add' | 'subdialog' | 'pack' | 'rewrite';
  onSave: (data: any) => void;
  onClose: () => void;
  initialPrompt?: string;
  contextText?: string;
}

interface GeneratedDialog {
    text: string;
    tone: string;
}

export const AIDialogWriter: React.FC<AIDialogWriterProps> = ({ mode, onSave, onClose, initialPrompt, contextText }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);


  const handleGenerate = async () => {
    // For rewrite, prompt can be empty (meaning "any tone")
    if (!prompt && mode !== 'rewrite') return;
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSelected({});
    setFocusedIndex(-1);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        let schema: any;
        let modelPrompt: string;

        if (mode === 'pack') {
            modelPrompt = `Generate a dialog pack for gamers based on the theme: "${prompt}". The pack should contain 2-4 main scenarios. Each scenario should have 2-3 variants with different styles/tones. Each variant must have 3-5 short, punchy sub-dialog messages. Structure the output according to the provided JSON schema.`;
            schema = {
                type: Type.OBJECT,
                properties: {
                  dialogPack: {
                    type: Type.ARRAY,
                    description: "An array of 2-4 main scenarios.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        scenario: { type: Type.STRING, description: "The name of the high-level scenario (e.g., 'Greetings', 'Tactical')." },
                        variants: {
                          type: Type.ARRAY,
                          description: "An array of 2-3 variants for the scenario, each with a different style or tone.",
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              variantName: { type: Type.STRING, description: "The name of the style variant (e.g., 'Friendly', 'Urgent')." },
                              dialogs: {
                                type: Type.ARRAY,
                                description: "An array of 3-5 short, punchy sub-dialog messages for this variant.",
                                items: { type: Type.STRING }
                              }
                            },
                            required: ['variantName', 'dialogs']
                          }
                        }
                      },
                      required: ['scenario', 'variants']
                    }
                  }
                },
                required: ['dialogPack']
            };
        } else if (mode === 'rewrite') {
             modelPrompt = `Rewrite the following text: "${contextText}".
             Target tone/style: "${prompt || 'Generate 5 unique variations with different tones/styles'}".
             Keep the messages short, punchy, and suitable for in-game chat.`;
             schema = {
                type: Type.OBJECT,
                properties: {
                  dialogs: {
                    type: Type.ARRAY,
                    description: "A list of 5 rewritten options.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                          text: { type: Type.STRING, description: 'The rewritten dialog text.' },
                          tone: { type: Type.STRING, description: 'The tone of this variation.' }
                      },
                      required: ['text', 'tone']
                    }
                  }
                },
                required: ['dialogs']
            };
        } else {
            modelPrompt = mode === 'subdialog'
              ? `Generate 5 alternative chat messages for a gamer based on this idea: "${prompt}". The messages should be short, punchy, and have a variety of tones.`
              : `Generate 5 alternative chat messages for a gamer based on this idea: "${prompt}". The messages should be short and suitable for fast-paced games. Provide a variety of tones.`;
            schema = {
                type: Type.OBJECT,
                properties: {
                  dialogs: {
                    type: Type.ARRAY,
                    description: "A list of 5 generated dialog options.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                          text: { type: Type.STRING, description: 'The dialog text. Must be short and punchy.' },
                          tone: { type: Type.STRING, description: 'The tone of the dialog (e.g., funny, serious, sarcastic).' }
                      },
                      required: ['text', 'tone']
                    }
                  }
                },
                required: ['dialogs']
            };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: modelPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonResponse = JSON.parse(response.text);
        setResults(jsonResponse);

        if (mode === 'subdialog' && jsonResponse.dialogs) {
            const initialSelection = jsonResponse.dialogs.reduce((acc: Record<string, boolean>, result: GeneratedDialog) => {
                acc[result.text] = true;
                return acc;
            }, {});
            setSelected(initialSelection);
        }

    } catch (e) {
      console.error(e);
      setError('Failed to generate content. Please check your prompt or API key.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!results || !(results.dialogs?.length > 0)) return;

        let newIndex = focusedIndex;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = focusedIndex >= results.dialogs.length - 1 ? 0 : focusedIndex + 1;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = focusedIndex <= 0 ? results.dialogs.length - 1 : focusedIndex - 1;
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex !== -1) {
                const selectedResult = results.dialogs[focusedIndex];
                if (mode === 'add' || mode === 'rewrite') {
                    onSave([selectedResult.text]);
                } else if (mode === 'subdialog') {
                    handleToggleSelection(selectedResult.text);
                }
            }
        }
        setFocusedIndex(newIndex);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, focusedIndex, mode, onSave]);

  useEffect(() => {
    if (focusedIndex !== -1 && resultsRef.current) {
        const item = resultsRef.current.children[focusedIndex] as HTMLElement;
        if (item) {
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
  }, [focusedIndex]);
  
  const handleToggleSelection = (text: string) => {
      setSelected(prev => ({ ...prev, [text]: !prev[text] }));
  };

  const handleSaveSubdialogs = () => {
      const selectedTexts = Object.entries(selected).filter(([, isSelected]) => isSelected).map(([text]) => text);
      if (selectedTexts.length > 0) {
          onSave(selectedTexts);
      }
      onClose();
  };
  
  const renderResults = () => {
    if (isLoading) return <div style={{textAlign: 'center', paddingTop: '40px'}}>Generating...</div>;
    if (error) return <div style={{textAlign: 'center', color: 'red', paddingTop: '40px'}}>{error}</div>;
    if (!results) return null;

    if (mode === 'pack' && results.dialogPack) {
      return (
        <div className="ai-pack-preview">
          <h3>Generated Pack Preview</h3>
          {results.dialogPack.map((scenario: any, sIndex: number) => (
            <div key={sIndex}>
              <p className="scenario">{scenario.scenario}</p>
              <div style={{ marginLeft: '16px'}}>
                {(scenario.variants || []).map((variant: any, vIndex: number) => (
                    <div key={vIndex}>
                        <p className="variant">{variant.variantName}</p>
                        <ul>
                           {(variant.dialogs || []).map((dialog: string, dIndex: number) => (
                            <li key={dIndex}>{dialog}</li>
                           ))}
                        </ul>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if ((mode === 'add' || mode === 'subdialog' || mode === 'rewrite') && results.dialogs) {
        return (
            <div ref={resultsRef}>
                {results.dialogs.map((result: GeneratedDialog, index: number) => {
                    const isFocused = index === focusedIndex;
                    
                    return (mode === 'add' || mode === 'rewrite') ? (
                        <button key={index} onClick={() => onSave([result.text])} className={`ai-result-item ${isFocused ? 'focused' : ''}`}>
                            <div className="tone">{result.tone}</div>
                            <p>{result.text}</p>
                        </button>
                    ) : (
                        <label key={index} htmlFor={`res-${index}`} className={`ai-result-item ${isFocused ? 'focused' : ''}`} style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <input type="checkbox" id={`res-${index}`} checked={!!selected[result.text]} onChange={() => handleToggleSelection(result.text)} />
                            <div>
                                <div className="tone">{result.tone}</div>
                                <p>{result.text}</p>
                            </div>
                        </label>
                    )
                })}
            </div>
        );
    }
    return null;
  };
  
  const getHeader = () => {
      switch(mode) {
          case 'pack': return { title: 'Generate Dialog Pack', description: 'Describe a theme, and AI will create a full set of dialogs.', icon: SparklesIcon };
          case 'subdialog': return { title: 'Generate Variations', description: 'Generate variations for your message.', icon: SparklesIcon };
          case 'rewrite': return { title: 'Rewrite / Change Tone', description: `Rewriting: "${contextText}"`, icon: WandIcon };
          case 'add': return { title: 'AI Dialog Writer', description: 'Describe the message you want, and AI will create options for you.', icon: SparklesIcon };
          default: return {title: '', description: '', icon: SparklesIcon };
      }
  }

  const HeaderIcon = getHeader().icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
            <h2>
                <HeaderIcon className="icon" style={{color: '#d8b4fe'}}/>
                {getHeader().title}
            </h2>
            <button onClick={onClose} className="close-btn" aria-label="Close">
                <XIcon className="icon"/>
            </button>
        </header>
        
        <div className="modal-content" style={{flexGrow: 1}}>
            <p>{getHeader().description}</p>
            <div style={{display: 'flex', gap: '8px'}}>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'pack' ? "e.g., pirate taunts" : mode === 'rewrite' ? "e.g., Sarcastic, Professional, Funny..." : "e.g., a friendly way to say hello"}
                    className="input-inset"
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                    autoFocus
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="btn btn-purple"
                >
                    {isLoading ? '...' : 'Generate'}
                </button>
            </div>

            <div className="ai-results-container">
                {renderResults()}
            </div>
            
            <footer style={{borderTop: '1px solid var(--color-panel-border)', paddingTop: '16px'}}>
                {mode === 'subdialog' && results?.dialogs && (
                    <button onClick={handleSaveSubdialogs} className="btn btn-green" style={{width: '100%'}}>
                        Save Variations
                    </button>
                )}
                {mode === 'pack' && results?.dialogPack && (
                    <button onClick={() => onSave({ ...results, theme: prompt })} className="btn btn-green" style={{width: '100%'}}>
                        Add as New Preset
                    </button>
                )}
            </footer>
        </div>
      </div>
    </div>
  );
};
