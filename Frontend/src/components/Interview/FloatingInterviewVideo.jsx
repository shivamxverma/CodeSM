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
                className="fixed bottom-4 right-4 z-50 w-[260px] rounded-md border border-dashed border-hairline bg-canvas/95 backdrop-blur-md p-4 text-center text-xs text-mute shadow-md"
            >
                No camera preview — grant access on the setup step to enable picture-in-picture.
            </div>
        );
    }

    return (
        <div
            className="fixed bottom-4 right-4 z-50 w-[260px] overflow-hidden rounded-md border border-hairline bg-black shadow-lg"
        >
            <video ref={videoRef} className="h-[150px] w-full object-cover" playsInline muted autoPlay />
            <div className="flex items-center justify-center gap-2 border-t border-hairline bg-canvas px-2 py-2">
                <button
                    type="button"
                    onClick={() => setMicOn((m) => !m)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                        micOn 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                >
                    Mic {micOn ? 'on' : 'off'}
                </button>
                <button
                    type="button"
                    onClick={() => setCamOn((c) => !c)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-all cursor-pointer ${
                        camOn 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                >
                    Cam {camOn ? 'on' : 'off'}
                </button>
            </div>
        </div>
    );
}
