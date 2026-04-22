import { useAuth } from "@/hooks/AuthContext";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";

export const GoogleAuth = ({
  onLoadingChange,
  label = "Continue with Google",
  className,
  disabled,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { startGoogleRedirect } = useAuth();

  const updateLoadingState = useCallback(
    (loading) => {
      setIsLoading(loading);
      onLoadingChange?.(loading);
    },
    [onLoadingChange],
  );

  const handleLogin = useCallback(() => {
    updateLoadingState(true);
    // Redirect-based flow; the page will navigate away
    startGoogleRedirect();
  }, [startGoogleRedirect, updateLoadingState]);

  return (
    <Button
      variant="outline"
      onClick={handleLogin}
      disabled={isLoading || disabled}
      className={`h-12 bg-background hover:bg-gradient-to-r hover:from-primary/5 hover:via-purple-500/5 hover:to-pink-500/5 border-2 border-input hover:border-primary/60 transition-all duration-300 flex items-center gap-3 justify-center text-sm font-semibold shadow-md hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] group/btn ${className || ""}`}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
      ) : (
        <svg className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span className="text-foreground group-hover/btn:text-primary transition-colors duration-300">{isLoading ? "Signing in..." : label}</span>
    </Button>
  );
};

export default GoogleAuth;
