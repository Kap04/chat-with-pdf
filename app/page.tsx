import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, FileText, MessageCircle, Upload, Globe, Zap, BrainCog, Eye, ServerCog, MonitorSmartphone } from "lucide-react"
import Link from "next/link"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { cn } from "@/lib/utils"
import AnimatedGradientText from "../components/ui/animated-gradient-text"
import Header from "@/components/Header"
import AnimatedGridPattern  from "@/components/ui/animated-grid-pattern"

const features = [
  {
    name: "Store your PDF Documents",
    description: "Keep all your important PDF files securely stored and easily accessible anytime, anywhere",
    icon: Globe
  },
  {
    name: "Blazing Fast Responses",
    description: "Experience lightning-fast answers to your queries, ensuring you get the information you need instantly.",
    icon: Zap
  },
  {
    name: "Chat Memorisation",
    description: "Our intelligent chatbot remembers previous interactions, providing a seamless and personalized experience.",
    icon: BrainCog,
  },
  {
    name: "Interactive PDF viewer",
    description: "Engage with your PDFs like never before using our intuitive and interactive viewer.",
    icon: Eye
  },
  {
    name: "Cloud Backup",
    description: "Rest assured knowing your documents are safely backed up on the cloud, protected from loss or damage.",
    icon: ServerCog
  },
  {
    name: "Responsive Across Devices",
    description: "Access and chat with your PDFs seamlessly on any device, whether it's your desktop, tablet, or smartphone.",
    icon: MonitorSmartphone
  }
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header/>
      <main className="flex-1 overflow-y-auto">
        <section className="relative flex items-center -mt-10 justify-center min-h-screen bg-white overflow-hidden">
          <AnimatedGridPattern
            className={cn(
              "bg-gradient-to-b", // Define the gradient direction
    "from-transparent via-white/30 to-transparent",
              "inset-x-0 inset-y-[-30%] w-full h-[200%] skew-y-12",
            )}
            width={70}
            height={100}
            strokeDasharray={2}
            numSquares={30}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
          />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <AnimatedGradientText>
                  <span
                    className={cn(
                      `inline animate-gradient bg-gradient-to-r from-[#40a9ff] via-[#9c40ff] to-[#40a9ff] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-9xl/none`
                    )}
                  >
                    Chat with Your PDFs
                  </span>
                </AnimatedGradientText>
                <p className="mx-auto max-w-[800px] pt-4 text-gray-600 md:text-xl">
                  Chat-with-PDF is a simple and powerful tool that lets you easily interact with any PDF. Just upload your document, ask questions, and get instant, accurate answers from the content. It's a quick way to understand reports, research, or any text-heavy files without the hassle of reading through everything.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <RainbowButton><Link href="/dashboard">Get Started</Link></RainbowButton>
                <Button size="lg" variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="flex items-center justify-center py-20 bg-gray-100">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-7xl text-center mb-12 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-lg shadow-md">
                <Upload className="h-12 w-12 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">Upload</h3>
                <p className="text-center text-gray-600">
                  Simply upload your PDF document to our secure platform.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-lg shadow-md">
                <BookOpen className="h-12 w-12 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800 ">Analyze</h3>
                <p className="text-center text-gray-600">
                  Our AI quickly analyzes and indexes the content of your PDF.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-lg shadow-md">
                <MessageCircle className="h-12 w-12 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">Chat</h3>
                <p className="text-center text-gray-600">
                  Start chatting with your PDF to extract insights and information.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="flex items-center justify-center py-20 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-7xl text-center mb-12 text-gray-900">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-4 p-6 bg-gray-50 rounded-lg shadow-md">
                  <feature.icon className="h-12 w-12 text-indigo-600" />
                  <h3 className="text-xl text-gray-800  font-bold">{feature.name}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-white border-t border-gray-200">
        <div className="container flex flex-col gap-2 sm:flex-row items-center px-4 md:px-6">
          <p className="text-xs text-gray-600">
            © 2024 Chat with PDF. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs text-gray-600 hover:text-indigo-600" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs text-gray-600 hover:text-indigo-600" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}