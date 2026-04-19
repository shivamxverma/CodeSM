export const INTERVIEW_ROLES = [
    { id: 'frontend', name: 'Frontend Developer', desc: 'React, Vue, Angular', icon: '💻' },
    { id: 'backend', name: 'Backend Developer', desc: 'APIs, Databases, Server', icon: '☁️' },
    { id: 'fullstack', name: 'Full Stack Developer', desc: 'Frontend + Backend', icon: '🚀' },
    { id: 'data_scientist', name: 'Data Scientist', desc: 'ML, Analytics, Python', icon: '📊' },
    { id: 'devops', name: 'DevOps Engineer', desc: 'CI/CD, Cloud, Docker', icon: '⚙️' },
    { id: 'mobile', name: 'Mobile Developer', desc: 'iOS, Android, React Native', icon: '📱' },
    { id: 'ml_engineer', name: 'Machine Learning Engineer', desc: 'AI, Deep Learning, Models', icon: '🤖' },
    { id: 'product_manager', name: 'Product Manager', desc: 'Strategy, roadmaps, analytics', icon: '📈' },
];

export const INTERVIEW_EXPERIENCE_LEVELS = [
    { id: 'entry', name: 'Entry Level', years: '0-1 years' },
    { id: 'junior', name: 'Junior', years: '2-3 years' },
    { id: 'mid', name: 'Mid-Level', years: '4-6 years' },
    { id: 'senior', name: 'Senior', years: '7+ years' },
    { id: 'staff', name: 'Staff/Principal', years: '10+ years' },
];

/** Allowed question counts sent to the API */
export const INTERVIEW_QUESTION_COUNTS = [1,2,3,4,5,6,7,8,9,10];

/** Overall difficulty tone for the whole interview */
export const INTERVIEW_LEVELS = [
    { id: 'easy', name: 'Easy' },
    { id: 'medium', name: 'Medium' },
    { id: 'hard', name: 'Hard' },
    { id: 'mixed', name: 'Mixed (adaptive)' },
];

/** Practice round: shapes question style */
export const INTERVIEW_ROUNDS = [
    { id: 'technical', name: 'Technical (DSA)' },
    { id: 'behavioral', name: 'Behavioral' },
    { id: 'lld', name: 'Low-Level Design (LLD)' },
    { id: 'system_design', name: 'System Design' },
];

/** Languages for Technical / LLD rounds (Monaco `language` id) */
export const INTERVIEW_CODE_LANGUAGES = [
    { id: 'python', name: 'Python', monacoLanguage: 'python' },
    { id: 'javascript', name: 'JavaScript', monacoLanguage: 'javascript' },
    { id: 'typescript', name: 'TypeScript', monacoLanguage: 'typescript' },
    { id: 'java', name: 'Java', monacoLanguage: 'java' },
    { id: 'cpp', name: 'C++', monacoLanguage: 'cpp' },
    { id: 'csharp', name: 'C#', monacoLanguage: 'csharp' },
    { id: 'go', name: 'Go', monacoLanguage: 'go' },
    { id: 'rust', name: 'Rust', monacoLanguage: 'rust' },
    { id: 'kotlin', name: 'Kotlin', monacoLanguage: 'kotlin' },
];

export function roundUsesCodeEditor(roundId) {
    return roundId === 'technical' || roundId === 'lld';
}

export const RECORDING_MAX_SECONDS = 90;
