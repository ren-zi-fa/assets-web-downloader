import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Install } from "./components/Install";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { LanguageProvider } from "./i18n/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Install />
          <Faq />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
