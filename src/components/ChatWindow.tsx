import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Character, type Message } from '../db';
import { Send, User, Bot, Trash2, Sparkles, Loader2, ArrowLeft, Image as ImageIcon, Upload, X } from 'lucide-react';
import { generateRoleplayResponse, generateImage } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AppSettings } from './SettingsModal';
import { ConfirmModal } from './ConfirmModal';
import { CharacterProfileModal } from './CharacterProfileModal';

interface ChatWindowProps {
  character: Character;
  onBack?: () => void;
  settings: AppSettings;
}

export function ChatWindow({ character, onBack, settings }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Character | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useLiveQuery(
    () => db.messages.where('characterId').equals(character.id!).sortBy('timestamp'),
    [character.id]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isGenerating) return;

    const userMessage: Message = {
      characterId: character.id!,
      text: inputText,
      image: selectedImage,
      timestamp: Date.now(),
      role: 'user',
    };

    await db.messages.add(userMessage);
    const currentInput = inputText;
    const currentImage = selectedImage;
    setInputText('');
    setSelectedImage(undefined);

    if (character.isAI) {
      setIsGenerating(true);
      try {
        const history = (messages || []).slice(-10).map(m => ({
          role: m.role,
          text: m.text,
          image: m.image
        }));

        const aiResponse = await generateRoleplayResponse(
          character.systemPrompt || `Eres ${character.name}. ${character.description}`,
          history,
          currentInput,
          currentImage,
          settings.nsfwEnabled,
          settings.shortWritingEnabled,
          settings.superNsfwEnabled,
          settings.superNsfwEndpoint
        );

        if (aiResponse) {
          await db.messages.add({
            characterId: character.id!,
            text: aiResponse,
            timestamp: Date.now(),
            role: 'assistant',
            isSuperNsfw: settings.superNsfwEnabled
          });
        }
      } catch (error) {
        console.error("Error generating AI response:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (isGenerating || (!inputText.trim() && (!messages || messages.length === 0))) return;
    setIsGenerating(true);
    try {
      const currentInput = inputText.trim();
      if (currentInput) {
        const userMessage: Message = {
          characterId: character.id!,
          text: `[Solicitud de imagen]: ${currentInput}`,
          timestamp: Date.now(),
          role: 'user',
        };
        await db.messages.add(userMessage);
        setInputText('');
      }

      const recentMessages = (messages || []).slice(-4).map(m => `${m.role === 'user' ? 'User' : character.name}: ${m.text}`).join('\n');
      const enhancedPrompt = `A visual scene featuring ${character.name}. Character description: ${character.description}. Recent conversation context: "${recentMessages}". ${currentInput ? `Specific action/request: ${currentInput}.` : 'Generate an image representing the current moment in the conversation.'} High quality, detailed, masterpiece.`;

      const imageUrl = await generateImage(enhancedPrompt, settings.nsfwEnabled, settings.customImageEndpoint, settings.superNsfwEnabled, settings.superNsfwEndpoint);
      await db.messages.add({
        characterId: character.id!,
        text: '',
        image: imageUrl,
        timestamp: Date.now(),
        role: 'assistant',
        isSuperNsfw: settings.superNsfwEnabled
      });
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("Requested entity was not found") || error?.message?.includes("403") || error?.message?.includes("PERMISSION_DENIED")) {
        setErrorMsg("Error de permisos. Es posible que necesites seleccionar una clave de API válida o tu clave no tiene acceso a este modelo.");
        if (window.aistudio?.openSelectKey) {
           window.aistudio.openSelectKey().catch(console.error);
        }
      } else {
        setErrorMsg(error?.message || "Error al generar la imagen. Intenta con otro prompt o revisa la configuración de tu endpoint.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (isGenerating || !character.isAI) return;
    setIsGenerating(true);
    try {
      const history = (messages || []).slice(-10).map(m => ({
        role: m.role,
        text: m.text,
        image: m.image
      }));

      const aiResponse = await generateRoleplayResponse(
        character.systemPrompt || `Eres ${character.name}. ${character.description}`,
        history,
        "(Continúa la historia/conversación)",
        undefined,
        settings.nsfwEnabled,
        settings.shortWritingEnabled,
        settings.superNsfwEnabled,
        settings.superNsfwEndpoint
      );

      if (aiResponse) {
        await db.messages.add({
          characterId: character.id!,
          text: aiResponse,
          timestamp: Date.now(),
          role: 'assistant',
          isSuperNsfw: settings.superNsfwEnabled
        });
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Error al continuar la respuesta.");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmClearChat = async () => {
    await db.messages.where('characterId').equals(character.id!).delete();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <header className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div 
            className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => setViewingProfile(character)}
          >
            {character.icon ? (
              <img src={character.icon} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-zinc-500" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              {character.name}
              {character.isAI && <Bot size={14} className="text-blue-400" />}
            </h2>
            <p className="text-xs text-zinc-500 line-clamp-1">{character.description}</p>
          </div>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
          title="Limpiar chat"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages?.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border",
                  msg.role === 'user' 
                    ? "bg-blue-600 border-blue-500" 
                    : "bg-zinc-800 border-zinc-700 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors"
                )}
                onClick={() => msg.role === 'assistant' && setViewingProfile(character)}
              >
                {msg.role === 'user' ? (
                  <User size={16} className="text-white" />
                ) : character.icon ? (
                  <img src={character.icon} alt={character.name} className="w-full h-full object-cover" />
                ) : (
                  <Bot size={16} className="text-zinc-400" />
                )}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user'
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : msg.isSuperNsfw 
                    ? "bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-tl-none"
                    : "bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none"
              )}>
                {msg.image && (
                  <img src={msg.image} alt="Contenido adjunto" className="max-w-full rounded-lg mb-2 object-contain max-h-64" />
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isGenerating && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Loader2 size={16} className="text-blue-400 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 rounded-tl-none flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400 animate-pulse" />
              <span className="text-zinc-400 text-xs italic">Escribiendo...</span>
            </div>
          </div>
        )}
          {/* Continue Button */}
          {messages && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isGenerating && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-zinc-100 transition-all shadow-lg backdrop-blur-sm"
              >
                <Sparkles size={14} className="text-blue-400" />
                Continuar respuesta
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 relative">
        {errorMsg && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="hover:text-red-300">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-zinc-700 object-cover" />
              <button
                onClick={() => setSelectedImage(undefined)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            {settings.imageUploadEnabled && (
              <label className="w-10 h-10 flex-shrink-0 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all cursor-pointer">
                <Upload size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isGenerating} />
              </label>
            )}
            
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Escribe algo para ${character.name}...`}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-6 py-3 pr-14 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedImage) || isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all"
              >
                <Send size={18} />
              </button>
            </div>

            {settings.imageGenEnabled && (
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGenerating || (!inputText.trim() && (!messages || messages.length === 0))}
                title="Generar imagen de la escena actual"
                className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/40 text-purple-400 disabled:opacity-50 flex items-center justify-center transition-all"
              >
                <ImageIcon size={18} />
              </button>
            )}
          </form>
          <p className="text-[10px] text-center text-zinc-600 mt-2">
            Tus datos se guardan localmente en este navegador.
          </p>
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="Vaciar Chat"
          message="¿Estás seguro de que quieres borrar todo el historial de mensajes con este personaje? Esta acción no se puede deshacer."
          confirmText="Vaciar"
          onConfirm={confirmClearChat}
          onCancel={() => setShowClearConfirm(false)}
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
