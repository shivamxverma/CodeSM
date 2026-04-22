import React, { useCallback, useEffect, useRef, useState } from 'react';

export function InterviewMediaPermissionsStep({ onGranted, onCancel, isLoading, apiError }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const transferredRef = useRef(false);
    const [error, setError] = useState('');
    const [streamReady, setStreamReady] = useState(false);
    const [micLevel, setMicLevel] = useState(0);
    const rafRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);

    const stopPreview = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        analyserRef.current = null;
        if (!transferredRef.current && streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStreamReady(false);
        setMicLevel(0);
    }, []);

    const startPreview = useCallback(async () => {
        transferredRef.current = false;
        setError('');
        setStreamReady(false);
        stopPreview();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 360 } },
                audio: true,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack && window.AudioContext) {
                const ctx = new AudioContext();
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                audioCtxRef.current = ctx;
                analyserRef.current = analyser;
                const data = new Uint8Array(analyser.frequencyBinCount);
                const tick = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(data);
                    const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
                    setMicLevel(avg);
                    rafRef.current = requestAnimationFrame(tick);
                };
                rafRef.current = requestAnimationFrame(tick);
            }
            setStreamReady(true);
        } catch (err) {
            console.error(err);
            if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
                setError('Camera and microphone access was denied. Allow permissions in your browser to continue.');
            } else if (err?.name === 'NotFoundError') {
                setError('No camera or microphone was found. Connect a device and try again.');
            } else {
                setError('Could not access camera or microphone. Check browser settings and try again.');
            }
            setStreamReady(false);
        }
    }, [stopPreview]);

    useEffect(() => {
        void startPreview();
        return () => {
            stopPreview();
        };
    }, [startPreview, stopPreview]);

    const handleContinue = () => {
        if (!streamRef.current || error) return;
        transferredRef.current = true;
        const stream = streamRef.current;
        // streamRef.current = null;
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        analyserRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        onGranted(stream);
    };

    const hasStream = streamReady && !error;

    return (
        <div className="bg-background text-foreground min-h-screen p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Camera & microphone</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        We need access for your picture-in-picture preview during the technical interview. Nothing is
                        uploaded automatically.
                    </p>
                </div>

                <div
                    className="rounded-xl border border-border overflow-hidden bg-black aspect-video max-h-[220px] shadow-lg"
                    style={{ borderRadius: 12 }}
                >
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Mic level</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-[width] duration-75"
                            style={{ width: `${Math.min(100, micLevel * 200)}%` }}
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
                {apiError && <p className="text-sm text-destructive">{apiError}</p>}

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => void startPreview()}
                        className="flex-1 rounded-lg border border-border bg-card py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                        Retry access
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                        Back
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!hasStream || isLoading}
                    className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
                        !hasStream || isLoading
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isLoading ? 'Starting interview…' : 'Continue to interview'}
                </button>
            </div>
        </div>
    );
}
