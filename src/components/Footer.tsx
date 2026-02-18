import { motion } from "framer-motion";
import { Github, Linkedin, ArrowUp, Zap } from "lucide-react";

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-auto border-t border-border/30 bg-gradient-to-b from-transparent to-card/40">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-bold text-lg">SmartRoutine</span>
          </div>

          <p className="text-sm text-muted-foreground italic max-w-md">
            "Designed to empower students with structured productivity."
          </p>

          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-[0_0_16px_hsl(250,80%,65%,0.3)] transition-all duration-300"
            >
              <Github className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-info hover:shadow-[0_0_16px_hsl(210,100%,52%,0.3)] transition-all duration-300"
            >
              <Linkedin className="h-5 w-5" />
            </motion.a>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Developed by <span className="gradient-text font-semibold">Shaikh Afroz</span>
            </p>
            <p className="text-xs text-muted-foreground">
              © 2026 Smart Routine Management System. All Rights Reserved.
            </p>
          </div>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3, scale: 1.1 }}
            className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
