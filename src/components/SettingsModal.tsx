import React from 'react';
import { X, ShieldAlert, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '../lib/utils';

export interface AppSettings {
  nsfwEnabled: boolean;
  imageGenEnabled: boolean;
  imageUploadEnabled: boolean;
  customImageEndpoint: string;
  shortWritingEnabled: boolean;
  superNsfwEnabled: boolean;
}

export const defaultSettings: AppSettings = {
  nsfwEnabled: false,
  imageGenEnabled: false,
  imageUploadEnabled: false,
  customImageEndpoint: '',
  shortWritingEnabled: false,
  superNsfwEnabled: false,
};

interface SettingsModalProps {
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export function SettingsModal({ onClose, settings, onUpdateSettings }: SettingsModalProps) {
  const toggleSetting = (key: keyof AppSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-zinc-100">Configuración</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* NSFW Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Modo NSFW</p>
                <p className="text-xs text-zinc-500">Desactiva los filtros de seguridad de la IA.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('nsfwEnabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                settings.nsfwEnabled ? "bg-red-600" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                settings.nsfwEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          {/* Super NSFW Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShieldAlert size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Súper NSFW</p>
                <p className="text-xs text-zinc-500">Modo ultra explícito sin restricciones. Color gris en chat.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('superNsfwEnabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                settings.superNsfwEnabled ? "bg-green-600" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                settings.superNsfwEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          {/* Short Writing Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Upload size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Escritura Corta</p>
                <p className="text-xs text-zinc-500">La IA responderá de forma más concisa y directa.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('shortWritingEnabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                settings.shortWritingEnabled ? "bg-blue-600" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                settings.shortWritingEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          {/* Image Generation Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <ImageIcon size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Generación de Imágenes</p>
                <p className="text-xs text-zinc-500">Permite crear imágenes con IA en el chat.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('imageGenEnabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                settings.imageGenEnabled ? "bg-purple-600" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                settings.imageGenEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          {/* Custom Image Endpoint */}
          {settings.imageGenEnabled && (
            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <p className="text-sm font-medium text-zinc-100">Endpoint Personalizado (Opcional)</p>
                <p className="text-xs text-zinc-500">URL de tu propia API para generar imágenes (ej. alojada en Vercel).</p>
              </div>
              <input
                type="url"
                value={settings.customImageEndpoint || ''}
                onChange={(e) => onUpdateSettings({ ...settings, customImageEndpoint: e.target.value })}
                placeholder="https://tu-api.com/generate"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          )}

          {/* Image Upload Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Upload size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Subida de Imágenes</p>
                <p className="text-xs text-zinc-500">Permite enviar fotos para que la IA las vea.</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('imageUploadEnabled')}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative flex-shrink-0",
                settings.imageUploadEnabled ? "bg-blue-600" : "bg-zinc-700"
              )}
            >
              <div className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                settings.imageUploadEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
