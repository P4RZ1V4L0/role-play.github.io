import React, { useState } from 'react';
import { db, type Character } from '../db';
import { User, Bot, Upload, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';

interface CharacterFormProps {
  onClose: () => void;
  character?: Character;
}

export function CharacterForm({ onClose, character }: CharacterFormProps) {
  const [name, setName] = useState(character?.name || '');
  const [description, setDescription] = useState(character?.description || '');
  const [isAI, setIsAI] = useState(character?.isAI || false);
  const [systemPrompt, setSystemPrompt] = useState(character?.systemPrompt || '');
  const [icon, setIcon] = useState(character?.icon || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const newCharacter: Character = {
      name,
      description,
      isAI,
      systemPrompt: isAI ? systemPrompt : undefined,
      icon,
    };

    if (character?.id) {
      await db.characters.update(character.id, newCharacter);
    } else {
      await db.characters.add(newCharacter);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-zinc-100">
            {character ? 'Editar Personaje' : 'Nuevo Personaje'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center overflow-hidden">
                {icon ? (
                  <img src={icon} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-zinc-600" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <Upload size={24} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-xs text-zinc-500">Haz clic para subir un icono</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Ej. El Sabio de la Montaña"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[80px]"
                placeholder="Describe brevemente quién es este personaje..."
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <Bot size={20} className={cn(isAI ? "text-blue-400" : "text-zinc-500")} />
                <div>
                  <p className="text-sm font-medium text-zinc-100">Controlado por IA</p>
                  <p className="text-xs text-zinc-500">¿Debería la IA actuar como este personaje?</p>
                </div>
              </div>
              <button
                onClick={() => setIsAI(!isAI)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  isAI ? "bg-blue-600" : "bg-zinc-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                  isAI ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            {isAI && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Instrucciones de Personalidad (Prompt)</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[120px]"
                  placeholder="Ej. Eres un anciano sabio y algo gruñón que habla en acertijos..."
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
