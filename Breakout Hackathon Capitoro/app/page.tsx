import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Shield, Zap, Users, TrendingUp, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-capitoro-navy text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-capitoro-purple/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-capitoro-teal/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connecting <span className="gradient-text">Investors</span> to{" "}
              <span className="gradient-text">Entrepreneurs</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              A student-focused incubator platform that bridges the gap between ideas and execution, powered by Solana
              blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=entrepreneur">
                <Button size="lg" className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                  Launch Your Startup
                </Button>
              </Link>
              <Link href="/register?role=investor">
                <Button size="lg" variant="outline" className="gradient-border">
                  Become an Investor
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute inset-0 bg-gradient-capitoro blur-3xl opacity-20 rounded-3xl"></div>
            <div className="relative bg-gray-900/60 backdrop-blur-sm p-6 rounded-3xl border border-gray-800">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
                <div className="relative w-64 h-64">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/capitoro-logo-DVaTXsLUJg0UmrecKgyWe5J4mgOu40.jpeg"
                    width={256}
                    height={256}
                    alt="Capitoro Logo"
                    className="rounded-xl"
                  />
                </div>
                <div className="text-4xl font-bold gradient-text">+</div>
                <div className="relative w-64 h-64">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Solana_logo.jpeg-5kMTeFrTMON13tnrYiYq96TDEoO0u2.png"
                    width={256}
                    height={256}
                    alt="Solana Logo"
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The Problem We're Solving</h2>
            <p className="text-xl text-gray-300">
              Even though there is a surge in student entrepreneurship, aspiring founders still face barriers to launch
              and grow their ventures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-capitoro-purple/20 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-capitoro-purple" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Limited Access to Funding</h3>
              <p className="text-gray-400">
                Students struggle to secure the capital needed to build MVPs and bring their ideas to life.
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-capitoro-blue/20 rounded-full flex items-center justify-center mb-4">
                <Users className="text-capitoro-blue" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lack of Visibility</h3>
              <p className="text-gray-400">
                Innovative ideas often remain hidden due to limited exposure to potential investors and partners.
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-capitoro-teal/20 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-capitoro-teal" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Difficulty Finding Collaborators</h3>
              <p className="text-gray-400">
                Finding like-minded team members who share a passion for innovation can be challenging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Solution</h2>
              <p className="text-xl text-gray-300 mb-8">
                We've built a student-focused incubator platform that bridges the gap between ideas and execution,
                powered by Solana blockchain.
              </p>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Register Startups</h4>
                    <p className="text-gray-400">Showcase your ideas and gain visibility in our ecosystem</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Connect with Collaborators</h4>
                    <p className="text-gray-400">Find team members who share your vision and passion</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Access Early-Stage Funding</h4>
                    <p className="text-gray-400">Secure the capital you need to build your MVP</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Smart Contracts on Solana</h4>
                    <p className="text-gray-400">Transparent, secure transactions for investments and payments</p>
                  </div>
                </li>
              </ul>

              <div className="mt-8">
                <Link href="/about">
                  <Button variant="ghost" className="group">
                    Learn more about our platform
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-capitoro blur-3xl opacity-20 rounded-3xl"></div>
              <div className="relative bg-gray-900/60 backdrop-blur-sm p-6 rounded-3xl border border-gray-800">
                <div className="flex items-center justify-center p-4">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/capitoro-logo-DVaTXsLUJg0UmrecKgyWe5J4mgOu40.jpeg"
                    width={400}
                    height={400}
                    alt="Capitoro Solution"
                    className="rounded-lg w-full max-w-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Capitoro?</h2>
            <p className="text-xl text-gray-300">
              We are combining blockchain with community to launch real-world startups from campus. No gatekeepers—just
              ideas, talent, and execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-capitoro-blue/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-capitoro-blue" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enhanced Security with Web3</h3>
              <p className="text-gray-400">
                Web 3.0 is far more secure than Web 2.0. In addition to limiting the potential for hacks and breaches,
                Web3 significantly limits the potential for fraud through the use of smart contracts.
              </p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-capitoro-teal/20 rounded-full flex items-center justify-center mb-4">
                <Users className="text-capitoro-teal" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community-Driven Innovation</h3>
              <p className="text-gray-400">
                Our platform fosters a vibrant community of students, mentors, and investors all working together to
                bring innovative ideas to life.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                Join Capitoro Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-900/60 backdrop-blur-sm p-12 rounded-3xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-capitoro blur-3xl opacity-20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-capitoro blur-3xl opacity-20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Ideas into Reality?</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Whether you're an entrepreneur with a groundbreaking idea or an investor looking for the next big
                opportunity, Capitoro is your gateway to success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register?role=entrepreneur">
                  <Button size="lg" className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                    Launch Your Startup
                  </Button>
                </Link>
                <Link href="/register?role=investor">
                  <Button size="lg" variant="outline" className="gradient-border">
                    Become an Investor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
