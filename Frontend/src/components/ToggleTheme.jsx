export default function ThemeToggle() {
  return (
    <button
      className="p-2 rounded-md border border-border"
      onClick={() =>
        document.documentElement.classList.toggle("dark")
      }
    >
      🌙
    </button>
  );
}
