
export interface DialogNode {
  id: string;
  key: string;
  text: string;
  children?: DialogNode[];
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface Preset {
    id: string;
    name: string;
    dialogs: DialogNode[];
}
