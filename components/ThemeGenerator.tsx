import React, { useState } from 'react';
import { Theme } from '../types';
import { generateGameTheme } from '../services/geminiService';
import { Loader2, Palette, Sparkles } from 'lucide-react';

interface ThemeGeneratorProps {
  currentTheme: Theme;
  onThemeApply: (theme: Theme, commentary: string) => void;
}

const ThemeGenerator: React.FC<ThemeGeneratorProps> = ({ currentTheme, onThemeApply }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateGameTheme(prompt);
      if (result) {
        onThemeApply(result.theme, result.commentary);
        setPrompt('');
      } else {
        setError("AI didn't return a valid theme. Try again.");
      }
    } catch (err) {
      setError("Failed to connect to AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="p-4 rounded-xl border mb-4 backdrop-blur-sm transition-colors duration-300"
      style={{ 
        borderColor: currentTheme.borderColor,
        backgroundColor: currentTheme.boardColor + '80' // Add transparency
      }}
    >
      <div className="flex items-center gap-2 mb-3" style={{ color: currentTheme.textColor }}>
        <Sparkles size={18} />
        <h3 className="font-semibold text-sm uppercase tracking-wider">AI Theme Generator</h3>
      </div>
      
      <form onSubmit={handleGenerate} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Cyberpunk City', 'Candy Land', 'Matrix'"
          disabled={isLoading}
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
          style={{ 
            backgroundColor: currentTheme.backgroundColor,
            color: currentTheme.textColor,
            border: `1px solid ${currentTheme.borderColor}`
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-opacity disabled:opacity-50"
          style={{ 
            backgroundColor: currentTheme.snakeColor,
            color: currentTheme.backgroundColor // Contrast against button bg
          }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Palette size={16} />}
          <span>Paint</span>
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ThemeGenerator;