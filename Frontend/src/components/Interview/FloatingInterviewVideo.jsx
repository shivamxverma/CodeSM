import React, { useEffect, useRef, useState } from 'react';

export function FloatingInterviewVideo({ stream }) {
    const videoRef = useRef(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);

    useEffect(() => {
        const v = videoRef.current;
        if (!v || !stream) return;
        v.srcObject = stream;
        void v.play().catch(() => {});
        return () => {
            v.srcObject = null;
        };
    }, [stream]);

    useEffect(() => {
        if (!stream) return;
        const a = stream.getAudioTracks()[0];
        if (a) a.enabled = micOn;
    }, [stream, micOn]);

    useEffect(() => {
        if (!stream) return;
        const t = stream.getVideoTracks()[0];
        if (t) t.enabled = camOn;
    }, [stream, camOn]);

    if (!stream) {
        return (
            <div
                className="fixed bottom-4 right-4 z-50 w-[260px] rounded-xl border border-dashed border-border bg-card/95 backdrop-blur-sm p-4 text-center text-xs text-muted-foreground shadow-lg"
                style={{ borderRadius: 12 }}
            >
                No camera preview — grant access on the setup step to enable picture-in-picture.
            </div>
        );
    }

    return (
        <div
            className="fixed bottom-4 right-4 z-50 w-[260px] overflow-hidden rounded-xl border border-border bg-black shadow-xl"
            style={{ borderRadius: 12 }}
        >
            <video ref={videoRef} className="h-[150px] w-full object-cover" playsInline muted autoPlay />
            <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-black/80 px-2 py-2">
                <button
                    type="button"
                    onClick={() => setMicOn((m) => !m)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                        micOn ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-600/30 text-red-300'
                    }`}
                >
                    Mic {micOn ? 'on' : 'off'}
                </button>
                <button
                    type="button"
                    onClick={() => setCamOn((c) => !c)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                        camOn ? 'bg-emerald-600/30 text-emerald-300' : 'bg-red-600/30 text-red-300'
                    }`}
                >
                    Cam {camOn ? 'on' : 'off'}
                </button>
            </div>
        </div>
    );
}
