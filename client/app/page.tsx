import Image from "next/image";
import NavBar  from "@/components/navbar/page";

export default function Home() {
  return (
    <div>
      <NavBar />
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-8">Welcome to CodeSM</h1>
        <Image
          src="/coding_illustration.svg"
          alt="Coding Illustration"
          width={600}
          height={400}
        />
      </main>
    </div>
  );
}
