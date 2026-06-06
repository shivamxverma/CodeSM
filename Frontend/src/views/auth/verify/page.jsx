import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "@/api/api";
import { Loader2, CheckCircle, XCircle, ChevronRight, ChevronDown } from "lucide-react";

export default function VerifyEmailPage() {
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const [showLangDropdown, setShowLangDropdown] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        verifyEmail(token)
            .then(() => {
                setStatus("success");
            })
            .catch((err) => {
                setStatus("error");
                const msg =
                    err.response?.data?.message ||
                    err.message ||
                    "Verification failed. Invalid or expired token.";
                setMessage(msg);
            });
    }, [token]);

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col text-ink font-sans">
      {/* Navigation */}
      <nav className="flex h-16 w-full items-center justify-between px-6 border-b border-hairline bg-canvas/80 backdrop-blur-md shadow-xs">
        <Link to="/" className="z-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold text-lg shadow-sm">
            <span>C</span>
          </div>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 mx-auto max-w-screen-lg w-full px-4 pb-24 sm:mt-12 md:px-8">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-12 lg:max-w-full lg:flex-row lg:items-start lg:space-x-12 lg:space-y-0">

          {/* Left Side - Verification Status */}
          <div className="mx-auto mt-6 w-full sm:w-96">
            <div className="flex-1 bg-canvas border border-hairline p-8 sm:p-10 rounded-md shadow-xs text-center">
              {/* Header */}
              <div className="mb-8 text-center">
                {status === "loading" && (
                  <>
                    <div className="w-16 h-16 bg-canvas-soft-2 border border-hairline rounded-full flex items-center justify-center mx-auto mb-6 text-link">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink">
                      Verifying…
                    </h1>
                    <p className="mt-4 text-sm text-body leading-relaxed">
                      Please wait while we verify your email address.
                    </p>
                  </>
                )}

                {status === "success" && (
                  <>
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink">
                      Your email is verified
                    </h1>
                    <p className="mt-4 text-sm text-body leading-relaxed">
                      Thank you for verifying your email. You can now access your account.
                    </p>
                  </>
                )}

                {status === "error" && (
                  <>
                    <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-ink">
                      Verification Failed
                    </h1>
                    <p className="mt-4 text-sm text-body leading-relaxed">
                      {message}
                    </p>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                {status === "success" && (
                  <Link
                    to="/"
                    className="w-full btn-primary font-semibold text-sm rounded-sm flex items-center justify-center cursor-pointer"
                  >
                    Go to Home
                  </Link>
                )}

                {status === "error" && (
                  <Link
                    to="/"
                    className="w-full btn-secondary font-semibold text-sm rounded-sm flex items-center justify-center cursor-pointer"
                  >
                    Back to Home
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Banner */}
          <div className="hidden lg:flex relative flex-1 flex-col overflow-hidden rounded-md border border-hairline bg-canvas-soft-2 p-12 text-center text-body shadow-2xs">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-hairline/20 pointer-events-none" />

            <div className="relative z-10 px-8 pb-4 pt-4">
              <h3 className="text-2xl font-bold tracking-tight text-ink">
                Solve problems to get better.
              </h3>
              <p className="mt-3 text-sm text-body">
                CodeSM AI Platform
              </p>
              <a
                href="https://code-sm.vercel.app/"
                className="inline-flex items-center justify-center pt-4 text-link hover:text-link-deep font-semibold transition-colors text-sm"
                target="_blank"
                rel="noreferrer"
              >
                Explore how it works
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 w-full items-center justify-center text-center text-xs text-mute sm:flex sm:px-6 sm:text-left border-t border-hairline pt-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>© CodeSM</span>
            <span>·</span>
            <Link
              to="/terms"
              className="hover:text-link transition-colors"
            >
              TOS
            </Link>
            <span>·</span>
            <Link
              to="/privacy"
              className="hover:text-link transition-colors"
            >
              Privacy Policies
            </Link>
            <span>·</span>
            <Link
              to="/imprint"
              className="hover:text-link transition-colors"
            >
              Imprint
            </Link>
          </div>

          {/* Language Selector */}
          <div className="relative mt-6 flex h-[46px] w-full justify-center sm:mt-0 sm:block sm:w-[140px] sm:pl-6">
            <div className="group relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex cursor-pointer items-center rounded-sm border border-hairline bg-canvas p-1 px-4 py-2 hover:shadow-xs transition-shadow text-ink"
              >
                <span className="ml-2 text-xs font-semibold">🇺🇸 English</span>
                <ChevronDown className="ml-1 h-3.5 w-3.5 text-mute" />
              </button>

              {showLangDropdown && (
                <div className="absolute bottom-full mb-1.5 left-0 min-w-full rounded-sm border border-hairline bg-canvas shadow-md text-ink">
                  <button className="flex w-full cursor-pointer items-center rounded-sm px-4 py-2 hover:bg-canvas-soft-2 text-xs font-semibold">
                    <span className="ml-2">🇩🇪 German</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
}
