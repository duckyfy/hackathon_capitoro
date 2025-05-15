import Image from "next/image"
import Link from "next/link"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10">
        <Image src="/logo.png" alt="Capitoro Logo" fill className="object-contain" priority />
      </div>
      <span className="font-bold text-xl gradient-text">Capitoro</span>
    </Link>
  )
}
