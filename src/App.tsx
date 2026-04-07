/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SettingsModal, type AppSettings, defaultSettings } from './components/SettingsModal';
import { MessageSquare, UserPlus, Key } from 'lucide-react';
import { cn } from './lib/utils';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | undefined>();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } catch (e) {
          console.error(e);
        }
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('roleplay_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('roleplay_settings', JSON.stringify(newSettings));
  };

  const selectedCharacter = useLiveQuery(
    () => selectedCharacterId ? db.characters.get(selectedCharacterId) : undefined,
    [selectedCharacterId]
  );

  if (isCheckingKey) {
    return <div className="flex h-screen w-full bg-zinc-950 items-center justify-center text-zinc-500">Cargando...</div>;
  }

  if (!hasKey) {
    return (
      <div className="flex h-screen w-full bg-zinc-950 items-center justify-center p-4">
        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key size={32} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">Se requiere Clave de API</h2>
          <p className="text-zinc-400 mb-6 text-sm leading-relaxed">
            Para usar las funciones avanzadas de generación de imágenes de esta aplicación, necesitas seleccionar una clave de API de Google Cloud con facturación habilitada.
            <br /><br />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              Más información sobre facturación
            </a>
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            Seleccionar Clave de API
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      <div className={cn(
        "h-full w-full md:w-80 md:flex flex-shrink-0 border-r border-zinc-800",
        selectedCharacter ? "hidden" : "flex"
      )}>
        <Sidebar 
          selectedCharacterId={selectedCharacterId} 
          onSelectCharacter={setSelectedCharacterId} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      </div>
      
      <main className={cn(
        "flex-1 flex flex-col relative h-full min-w-0",
        !selectedCharacter ? "hidden md:flex" : "flex"
      )}>
        {selectedCharacter ? (
          <ChatWindow 
            character={selectedCharacter} 
            onBack={() => setSelectedCharacterId(undefined)}
            settings={settings}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
            <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl rotate-3">
              <MessageSquare size={48} className="text-blue-500 -rotate-3" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-100 mb-2 font-serif">Bienvenido a Roleplay Studio</h2>
            <p className="text-zinc-500 max-w-md mb-8">
              Crea personajes únicos, dales una personalidad con IA y empieza tu aventura. Todo se guarda de forma segura en tu navegador.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                  <UserPlus size={18} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Crea Personajes</h3>
                <p className="text-xs text-zinc-500">Define nombres, descripciones y sube sus iconos personalizados.</p>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                  <MessageSquare size={18} className="text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Roleplay con IA</h3>
                <p className="text-xs text-zinc-500">Usa el poder de Gemini para dar vida a tus personajes y mundos.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          settings={settings} 
          onUpdateSettings={handleUpdateSettings} 
        />
      )}
    </div>
  );
}

