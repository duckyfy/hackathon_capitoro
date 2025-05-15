import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, Briefcase, GraduationCap, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-capitoro-navy text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Capitoro</h1>
            <p className="text-xl text-gray-300 mb-8">
              Bridging the gap between student entrepreneurs, investors, and talent
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
            <p className="text-lg text-gray-300 mb-6">
              Capitoro was founded with a clear mission: to empower student entrepreneurs by connecting them with the
              resources they need to succeed. We believe that some of the most innovative ideas come from university
              campuses, but students often lack the funding, mentorship, and connections to bring their visions to life.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              By leveraging the transparency and security of the Solana blockchain, we've created a platform where
              student entrepreneurs can showcase their ideas, secure funding, and build their teams—all in one place.
            </p>
            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-6">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/capitoro-logo-DVaTXsLUJg0UmrecKgyWe5J4mgOu40.jpeg"
                  alt="Capitoro Logo"
                  width={120}
                  height={120}
                  className="rounded-full"
                />
                <span className="text-2xl font-bold gradient-text">+</span>
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Solana_logo.jpeg-5kMTeFrTMON13tnrYiYq96TDEoO0u2.png"
                  alt="Solana Logo"
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <div className="w-12 h-12 bg-capitoro-purple/20 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="text-capitoro-purple" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Startup Incubation</h3>
                <p className="text-gray-300">
                  We provide a platform for student entrepreneurs to showcase their ideas, connect with investors, and
                  secure the funding they need to build MVPs and launch their startups.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex gap-2">
                    <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                    <span>Transparent funding through Solana blockchain</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                    <span>Project visibility to qualified investors</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                    <span>Progress tracking and milestone reporting</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <div className="w-12 h-12 bg-capitoro-blue/20 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="text-capitoro-blue" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Internship Connections</h3>
                <p className="text-gray-300">
                  We bridge the gap between student talent and startup opportunities by connecting university students
                  seeking internships with funded startups looking for passionate team members.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex gap-2">
                    <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                    <span>Real-world startup experience for students</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                    <span>Access to fresh talent for growing startups</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                    <span>Skill-based matching and mentorship</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <div className="w-12 h-12 bg-capitoro-teal/20 rounded-full flex items-center justify-center mb-4">
                <Users className="text-capitoro-teal" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Building</h3>
              <p className="text-gray-300">
                Beyond funding and internships, we're building a vibrant community of student entrepreneurs, investors,
                and mentors who share knowledge, provide support, and collaborate on innovative projects.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex gap-2">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                  <span>Networking events and workshops</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                  <span>Mentorship from experienced entrepreneurs</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={18} />
                  <span>Collaborative problem-solving and innovation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Internship Program Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Our Internship Program</h2>
            <p className="text-lg text-gray-300 mb-8 text-center">
              Connecting talented students with innovative startups
            </p>

            <div className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800 mb-8">
              <h3 className="text-xl font-semibold mb-4">For Students</h3>
              <p className="text-gray-300 mb-4">
                As a university student, you can gain valuable real-world experience by interning at one of our funded
                startups. This is your opportunity to:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Work on cutting-edge projects</h4>
                    <p className="text-gray-400">
                      Get hands-on experience with innovative technologies and business models
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Build your professional network</h4>
                    <p className="text-gray-400">Connect with founders, investors, and other talented students</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Develop entrepreneurial skills</h4>
                    <p className="text-gray-400">Learn what it takes to build a successful startup from the inside</p>
                  </div>
                </li>
              </ul>
              <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                Find Internships
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">For Startups</h3>
              <p className="text-gray-300 mb-4">
                As a funded startup on our platform, you can access a pool of talented university students eager to
                contribute to your success:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Find specialized talent</h4>
                    <p className="text-gray-400">
                      Connect with students who have the specific skills your startup needs
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Scale your team cost-effectively</h4>
                    <p className="text-gray-400">Bring on motivated interns to help you reach your milestones faster</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="text-capitoro-green shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold">Identify future team members</h4>
                    <p className="text-gray-400">Use internships as a pipeline for identifying full-time hires</p>
                  </div>
                </li>
              </ul>
              <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                Post Internship Opportunities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gray-900/60 backdrop-blur-sm p-12 rounded-3xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-capitoro blur-3xl opacity-20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-capitoro blur-3xl opacity-20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Capitoro Community</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Whether you're a student entrepreneur, an investor, or a student looking for internship opportunities,
                Capitoro is your gateway to innovation and growth.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
