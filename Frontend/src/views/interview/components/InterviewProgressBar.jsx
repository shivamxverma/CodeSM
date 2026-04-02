import React from 'react';

export function InterviewProgressBar({ progressPct }) {
    return (
        <div className="max-w-6xl mx-auto mb-6">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                />
            </div>
        </div>
    );
}
