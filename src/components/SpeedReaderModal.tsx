import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Zap,
  Gauge
} from 'lucide-react';

interface SpeedReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
}

export const SpeedReaderModal: React.FC<SpeedReaderModalProps> = ({
  isOpen,
  onClose,
  rawText,
}) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(350); // Words per minute default (Mailbird standard)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse words from raw text
  useEffect(() => {
    if (rawText) {
      // Split by whitespace and filter out empties
      const cleanedWords = rawText
        .replace(/[\r\n]+/g, ' ')
        .split(' ')
        .map(w => w.trim())
        .filter(w => w.length > 0);
      setWords(cleanedWords);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, [rawText, isOpen]);

  // Main playback ticker loop
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      const intervalMs = Math.max(50, Math.floor((60 / wpm) * 1000));
      timerRef.current = setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex, words, wpm]);

  // Keyboard controls: Space to toggle play/pause, Escape to exit, Arrows to step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 10));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(words.length - 1, prev + 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, words.length, onClose]);

  if (!isOpen) return null;

  const currentWord = words[currentIndex] || 'Início';
  const progressPercent = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const wordsLeft = words.length - currentIndex;
  const secondsLeft = Math.ceil((wordsLeft / wpm) * 60);

  // Compute Optimal Recognition Point (ORP) highlight (like Mailbird Speed Reader)
  const pivotIndex = Math.floor(currentWord.length / 3);
  const prefix = currentWord.slice(0, pivotIndex);
  const highlightChar = currentWord.charAt(pivotIndex);
  const suffix = currentWord.slice(pivotIndex + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Speed Reader</h3>
              <p className="text-[11px] text-slate-400">Leitor dinâmico sem fadiga ocular (estilo Mailbird)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Display Canvas (Focal Point) */}
        <div className="relative h-48 flex items-center justify-center bg-slate-950/60 border-y border-slate-800/80 px-6">
          {/* Subtle Focus Target Reticle Line */}
          <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0.5 bg-amber-500/20 pointer-events-none" />

          {/* Large Word with ORP red/amber anchor */}
          <div className="text-3xl md:text-4xl font-mono tracking-tight font-bold select-none text-center">
            <span className="text-slate-300">{prefix}</span>
            <span className="text-amber-400 font-black">{highlightChar}</span>
            <span className="text-slate-300">{suffix}</span>
          </div>

          {/* Completed notification */}
          {currentIndex === words.length - 1 && words.length > 0 && (
            <div className="absolute bottom-3 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Leitura finalizada!
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-sky-500 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls & Metrics */}
        <div className="p-5 flex flex-col gap-4 bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="tabular-nums">
              Palavra <strong className="text-white">{currentIndex + 1}</strong> de {words.length} ({Math.round(progressPercent)}%)
            </span>
            <span className="tabular-nums">
              Tempo restante: <strong className="text-white">{secondsLeft}s</strong>
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentIndex(0)}
              title="Reiniciar leitura"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 10))}
              title="Voltar 10 palavras"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all scale-105"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar</span>
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(words.length - 1, prev + 10))}
              title="Avançar 10 palavras"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* WPM Speed Selector */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Velocidade de leitura:</span>
            </div>
            <div className="flex items-center gap-1">
              {[200, 300, 350, 450, 600].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setWpm(speed)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                    wpm === speed
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {speed} <span className="text-[10px]">WPM</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            Dica: use a barra de <strong>Espaço</strong> para Iniciar/Pausar e as <strong>Setas</strong> para navegar.
          </div>
        </div>
      </div>
    </div>
  );
};
