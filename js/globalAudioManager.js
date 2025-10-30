// Global Audio Manager
// Handles one audio source shared between multiple players
// globalAudioManager.js
window.globalAudio = window.globalAudio || {
  current: null, // the player currently playing
  play(audioElement) {
    if (this.current && this.current !== audioElement) {
      this.current.pause(); // stop any other player
    }
    this.current = audioElement;
    audioElement.play();
  },
  pause(audioElement) {
    if (this.current === audioElement) {
      audioElement.pause();
      this.current = null;
    }
  }
};