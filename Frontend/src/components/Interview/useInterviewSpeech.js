import { useCallback, useRef, useState } from 'react';

export function useInterviewSpeech() {
    const [status, setStatus] = useState('idle');
    const utteranceRef = useRef(null);

    const stop = useCallback(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
        setStatus('idle');
    }, []);

    const speak = useCallback(
        (text) => {
            if (typeof window === 'undefined' || !window.speechSynthesis || !text?.trim()) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text.trim());
            u.rate = 1.08;
            u.onend = () => {
                utteranceRef.current = null;
                setStatus('idle');
            };
            u.onerror = () => {
                utteranceRef.current = null;
                setStatus('idle');
            };
            utteranceRef.current = u;
            window.speechSynthesis.speak(u);
            setStatus('playing');
        },
        []
    );

    const togglePause = useCallback(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setStatus('playing');
        } else if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            setStatus('paused');
        }
    }, []);

    const supported =
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.SpeechSynthesisUtterance !== 'undefined';

    return { speak, stop, togglePause, status, supported };
}
