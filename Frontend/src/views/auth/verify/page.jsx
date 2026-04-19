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
        <div className="min-h-screen bg-white flex flex-col">
            {/* Navigation */}
            <nav className="flex h-[74px] w-full items-center justify-between px-4">
                <Link to="/" className="z-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-md">
                        <span className="text-lg font-bold text-white">V</span>
                    </div>
                </Link>
            </nav>

            {/* Main Content */}
            <div className="flex-1 mx-auto max-w-screen-lg w-full px-4 pb-24 sm:mt-12 md:px-8">
                <div className="mx-auto flex w-full max-w-md flex-col space-y-24 lg:max-w-full lg:flex-row lg:items-start lg:space-x-24 lg:space-y-0">

                    {/* Left Side - Verification Status */}
                    <div className="mx-auto mt-6 w-full sm:w-96">
                        <div className="flex-1">
                            {/* Header */}
                            <div className="mb-8 text-center">
                                {status === "loading" && (
                                    <>
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                                            Verifying...
                                        </h1>
                                        <p className="mt-4 text-base text-gray-500">
                                            Please wait while we verify your email address.
                                        </p>
                                    </>
                                )}

                                {status === "success" && (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                                            Your email is verified
                                        </h1>
                                        <p className="mt-4 text-base text-gray-500">
                                            Thank you for verifying your email. You can now access your account.
                                        </p>
                                    </>
                                )}

                                {status === "error" && (
                                    <>
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <XCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                                            Verification Failed
                                        </h1>
                                        <p className="mt-4 text-base text-gray-500">
                                            {message}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mx-auto w-full sm:w-96 space-y-4">
                                {status === "success" && (
                                    <>
                                        {/* TODO: Change back to "/login" when launching properly */}
                                        <Link
                                            to="/"
                                            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center"
                                        >
                                            Go to Home
                                        </Link>
                                        {/* <Link
                                            to="/login"
                                            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center"
                                        >
                                            LOGIN
                                        </Link> */}
                                    </>
                                )}

                                {status === "error" && (
                                    <>
                                        {/* TODO: Change back to "/login" when launching properly */}
                                        <Link
                                            to="/"
                                            className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
                                        >
                                            Back to Home
                                        </Link>
                                        {/* <Link
                                            to="/login"
                                            className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
                                        >
                                            Back to Login
                                        </Link> */}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Banner */}
                    <div className="hidden lg:flex relative flex-1 flex-col overflow-hidden rounded-3xl text-center text-gray-700" style={{ backgroundColor: '#F2F2F2' }}>
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-200/30 pointer-events-none" />

                        <div className="relative z-10 px-16 pb-4 pt-16">
                            <h3 className="text-3xl font-bold">
                                Solve Problem To get Better
                            </h3>
                            <p className="mt-4 text-base text-gray-600">
                                 CodeSM
                            </p>
                            <a
                                href="https://code-sm.vercel.app/"
                                className="inline-flex items-center justify-center pt-4 hover:text-blue-500 transition-colors"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Explore how it works
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>
                        {/* <div className="relative h-[280px] w-full bg-cover bg-center bg-no-repeat z-10">
                            <Image
                                src="https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/smart-escalation.png"
                                alt="AI Agent Dashboard"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div> */}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 w-full items-center justify-center text-center text-sm text-gray-400 sm:flex sm:px-6 sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span>© CodeSM</span>
                        <span>·</span>
                        <Link
                            to="/terms"
                            className="hover:text-blue-500 transition-colors"
                        >
                            TOS
                        </Link>
                        <span>·</span>
                        <Link
                            to="/privacy"
                            className="hover:text-blue-500 transition-colors"
                        >
                            Privacy Policies
                        </Link>
                        <span>·</span>
                        <Link
                            to="/imprint"
                            className="hover:text-blue-500 transition-colors"
                        >
                            Imprint
                        </Link>
                    </div>

                    {/* Language Selector */}
                    <div className="relative mt-6 flex h-[46px] w-full justify-center sm:mt-0 sm:block sm:w-[140px] sm:pl-6">
                        <div className="group relative">
                            <button
                                onClick={() => setShowLangDropdown(!showLangDropdown)}
                                className="flex cursor-pointer items-center rounded-lg border border-gray-100 bg-white p-1 px-4 py-2 hover:shadow transition-shadow"
                            >
                                <span className="ml-2">🇺🇸 English</span>
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </button>

                            {showLangDropdown && (
                                <div className="absolute bottom-full mb-1 left-0 min-w-full rounded-lg border border-gray-100 bg-white shadow-lg">
                                    <button className="flex w-full cursor-pointer items-center rounded px-4 py-2 hover:bg-gray-100">
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
