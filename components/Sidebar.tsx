
import React, { useState } from 'react';
import { Preset } from '../types';
import { PlusCircleIcon, TrashIcon, PencilIcon, SaveIcon } from './icons';

interface SidebarProps {
  presets: Preset[];
  activePresetId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ presets, activePresetId, onSelect, onCreate, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (preset: Preset, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingId(preset.id);
      setEditName(preset.name);
  };

  const handleSaveEdit = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (editingId && editName.trim()) {
          onRename(editingId, editName);
      }
      setEditingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSaveEdit();
      if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>MY PRESETS</span>
      </div>
      <div className="sidebar-list">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`sidebar-item ${activePresetId === preset.id ? 'active' : ''}`}
            onClick={() => onSelect(preset.id)}
          >
            {editingId === preset.id ? (
                <div style={{display: 'flex', gap: '4px', alignItems: 'center', width: '100%'}}>
                    <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button className="sidebar-icon-btn" onClick={handleSaveEdit}><SaveIcon style={{width: '16px', height: '16px'}}/></button>
                </div>
            ) : (
                <>
                    <span>{preset.name}</span>
                    <div className="sidebar-actions">
                        <button className="sidebar-icon-btn" onClick={(e) => handleStartEdit(preset, e)} title="Rename"><PencilIcon style={{width: '14px', height: '14px'}}/></button>
                        {presets.length > 1 && (
                            <button className="sidebar-icon-btn" onClick={(e) => { e.stopPropagation(); onDelete(preset.id); }} title="Delete"><TrashIcon style={{width: '14px', height: '14px'}}/></button>
                        )}
                    </div>
                </>
            )}
          </div>
        ))}
      </div>
      <button className="add-preset-btn" onClick={onCreate}>
        <PlusCircleIcon style={{width: '16px', height: '16px'}} />
        New Preset
      </button>
    </div>
  );
};
