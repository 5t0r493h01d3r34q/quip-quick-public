
import React, { useState, useEffect } from 'react';
import { DialogNode } from '../types';
import { ClipboardIcon, CheckIcon, ChevronRightIcon, PencilIcon, TrashIcon, SaveIcon, SparklesIcon, SitemapIcon, WandIcon } from './icons';

interface DialogItemProps {
  dialog: DialogNode;
  isCopied: boolean;
  onSelect: () => void;
  isCategory?: boolean;
  isEditing: boolean;
  editingNodeId: string | null;
  onSetEditing: (id: string | null) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAddSubDialog: (id: string) => void;
  onGenerateSubDialogWithAI: (id: string) => void;
  onChangeTone: (id: string) => void;
}

export const DialogItem: React.FC<DialogItemProps> = ({ dialog, isCopied, onSelect, isCategory = false, isEditing, editingNodeId, onSetEditing, onUpdate, onDelete, onAddSubDialog, onGenerateSubDialogWithAI, onChangeTone }) => {
  const [editText, setEditText] = useState(dialog.text);
  const isCurrentlyEditing = editingNodeId === dialog.id;
  const isEffectivelyCategory = dialog.children != null;


  useEffect(() => {
    setEditText(dialog.text);
  }, [dialog.text]);

  const handleSave = () => {
    onUpdate(dialog.id, editText);
  };

  if (isEditing && isCurrentlyEditing) {
    return (
      <div className="edit-input-wrapper">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="input-inset"
        />
        <button onClick={handleSave} className="icon-btn" aria-label="Save">
          <SaveIcon className="icon icon-edit" />
        </button>
        <button onClick={() => onSetEditing(null)} className="icon-btn" aria-label="Cancel">
          <TrashIcon className="icon icon-delete" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={!isEditing ? onSelect : undefined}
      aria-label={`Select: ${dialog.text}`}
      role={!isEditing ? "button" : undefined}
      tabIndex={!isEditing ? 0 : -1}
      onKeyDown={(e) => !isEditing && (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className="dialog-item"
    >
      <div className="dialog-item-main">
        <div className="dialog-key">
          {dialog.key}
        </div>
        <span className="dialog-text">
          {dialog.text}
        </span>
      </div>
      <div className={isEditing ? 'dialog-item-controls' : ''}>
        {isEditing ? (
            <>
                {!isEffectivelyCategory && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onChangeTone(dialog.id); }} aria-label="Change Tone / Rewrite"><WandIcon className="icon icon-ai" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onGenerateSubDialogWithAI(dialog.id); }} aria-label="Generate Sub-Dialog with AI"><SparklesIcon className="icon icon-ai" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onAddSubDialog(dialog.id); }} aria-label="Add Sub-Dialog"><SitemapIcon className="icon icon-sub" /></button>
                        <div style={{width: '1px', height: '16px', backgroundColor: '#b0b9c6', margin: '0 4px'}}></div>
                    </>
                )}
                <button onClick={(e) => { e.stopPropagation(); onSetEditing(dialog.id); }} aria-label="Edit" ><PencilIcon className="icon icon-edit" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(dialog.id); }} aria-label="Delete"><TrashIcon className="icon icon-delete" /></button>
            </>
        ) : isCopied ? (
          <CheckIcon className="dialog-item-icon" style={{opacity: 1, color: 'var(--color-green-end)'}} />
        ) : isCategory ? (
            <ChevronRightIcon className="dialog-item-icon category-arrow" />
        ) : (
          <ClipboardIcon className="dialog-item-icon" />
        )}
      </div>
    </div>
  );
};
