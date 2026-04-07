import React from 'react';
import { X, Bot, User } from 'lucide-react';
import { type Character } from '../db';

interface CharacterProfileModalProps {
  character: Character;
  onClose: () => void;
}

export function CharacterProfileModal({ character, onClose }: CharacterProfileModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="relative h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl border-4 border-zinc-900 overflow-hidden bg-zinc-800 shadow-xl">
              {character.icon ? (
                <img src={character.icon} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  {character.isAI ? <Bot size={40} /> : <User size={40} />}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-16 p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">{character.name}</h2>
            <p className="text-sm text-blue-400 font-medium">
              {character.isAI ? 'Personaje IA' : 'Personaje Manual'}
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Descripción</h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {character.description || 'Sin descripción.'}
            </p>
          </div>

          {character.isAI && character.systemPrompt && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Personalidad (Prompt)</h3>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-400 italic leading-relaxed">
                  {character.systemPrompt}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
