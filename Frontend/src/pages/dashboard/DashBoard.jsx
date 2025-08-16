import React from "react";
import { Link } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

function DashBoard() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <div className="relative bg-black flex flex-col items-center justify-center py-20">
                <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
                <div className="w-full absolute inset-0 h-full">
                    <SparklesCore
                        id="tsparticlesfullpage"
                        background="transparent"
                        minSize={0.6}
                        maxSize={1.4}
                        particleDensity={100}
                        className="w-full h-full"
                        particleColor="#FFFFFF"
                    />
                </div>
                <div className="relative z-20 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        Welcome to codesm
                    </h1>
                    <p className="mt-4 text-lg text-gray-300">
                        Your platform to conquer coding challenges.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Get Started</h2>
                    <p className="text-gray-400">Choose an option below to begin your journey.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <Link to="/problems">
                        <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                            <h3 className="text-2xl font-semibold mb-4">View Problems</h3>
                            <p className="text-gray-400">
                                Browse through a collection of coding problems to sharpen your skills.
                            </p>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}

export default DashBoard;