
type SoundType = 'correct' | 'wrong' | 'lifeline' | 'lock' | 'start' | 'wait' | 'cheer';

// Using reliable CDN links for sound effects
const SOUND_URLS: Record<SoundType, string> = {
  correct: 'https://assets.mixkit.co/sfx/preview/mixkit-game-bonus-reached-2065.mp3',
  wrong: 'https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-3068.mp3',
  lifeline: 'https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3',
  lock: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3',
  start: 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-treasure-2066.mp3',
  wait: 'https://assets.mixkit.co/sfx/preview/mixkit-clock-ticking-ticker-1065.mp3',
  cheer: 'https://assets.mixkit.co/sfx/preview/mixkit-small-crowd-cheer-2064.mp3'
};

export const playSound = (type: SoundType) => {
  try {
    const audio = new Audio(SOUND_URLS[type]);
    // Keep volume subtle as requested
    if (type === 'cheer') {
        audio.volume = 0.25; // Slightly lower for background cheer
    } else {
        audio.volume = type === 'correct' || type === 'start' ? 0.4 : 0.3;
    }
    
    if (type === 'lock') {
        audio.volume = 0.5; // Slightly louder for the immediate feedback
    }

    audio.play().catch(e => {
      // Browsers often block auto-playing audio until user interacts with the page
      console.log("Sound playback prevented:", e);
    });
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};
