import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Character } from '../db';
import { Plus, User, Bot, Settings, Trash2, Edit2, MessageSquare } from 'lucide-react';
import { CharacterForm } from './CharacterForm';
import { ConfirmModal } from './ConfirmModal';
import { CharacterProfileModal } from './CharacterProfileModal';
import { cn } from '../lib/utils';

interface SidebarProps {
  selectedCharacterId?: number;
  onSelectCharacter: (id: number) => void;
  onOpenSettings: () => void;
}

export function Sidebar({ selectedCharacterId, onSelectCharacter, onOpenSettings }: SidebarProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [characterToDelete, setCharacterToDelete] = useState<number | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Character | null>(null);

  const characters = useLiveQuery(() => db.characters.toArray());

  const handleEdit = (e: React.MouseEvent, char: Character) => {
    e.stopPropagation();
    setEditingCharacter(char);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCharacterToDelete(id);
  };

  const confirmDelete = async () => {
    if (characterToDelete !== null) {
      await db.characters.delete(characterToDelete);
      await db.messages.where('characterId').equals(characterToDelete).delete();
      setCharacterToDelete(null);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <MessageSquare className="text-blue-500" />
          Roleplay
        </h1>
        <button
          onClick={() => {
            setEditingCharacter(undefined);
            setIsFormOpen(true);
          }}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          title="Nuevo Personaje"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {characters?.length === 0 ? (
          <div className="text-center py-10 px-4">
            <User size={40} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">No hay personajes aún. ¡Crea uno para empezar!</p>
          </div>
        ) : (
          characters?.map((char) => (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char.id!)}
              className={cn(
                "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                selectedCharacterId === char.id
                  ? "bg-blue-600/10 border-blue-500/50 text-blue-100"
                  : "bg-transparent border-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100"
              )}
            >
              <div 
                className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-blue-500/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingProfile(char);
                }}
              >
                {char.icon ? (
                  <img src={char.icon} alt={char.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate flex items-center gap-1.5">
                  {char.name}
                  {char.isAI && <Bot size={12} className="text-blue-400" />}
                </p>
                <p className="text-xs text-zinc-500 truncate">{char.description}</p>
              </div>

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEdit(e, char)}
                  className="p-1.5 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, char.id!)}
                  className="p-1.5 hover:bg-red-900/30 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div 
          onClick={onOpenSettings}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-100"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Configuración</span>
        </div>
      </div>

      {isFormOpen && (
        <CharacterForm
          onClose={() => setIsFormOpen(false)}
          character={editingCharacter}
        />
      )}

      {characterToDelete !== null && (
        <ConfirmModal
          title="Eliminar Personaje"
          message="¿Estás seguro de que quieres eliminar este personaje y todo su historial de chat? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          onConfirm={confirmDelete}
          onCancel={() => setCharacterToDelete(null)}
        />
      )}

      {viewingProfile && (
        <CharacterProfileModal
          character={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  );
}
