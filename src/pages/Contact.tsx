import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "015af05c-ed63-4a44-b813-7cb5c9cb04c8");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Contact</span>
        </div>
        <h1 className="text-3xl font-display font-bold">Get in Touch</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Have feedback or suggestions? We'd love to hear from you.
        </p>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        {/* Glow decorations */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />

        {status === "success" ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
            </motion.div>
            <h3 className="text-xl font-display font-bold">Message Sent!</h3>
            <p className="text-muted-foreground text-sm">Thank you for your feedback. We'll get back to you soon.</p>
            <Button variant="outline" onClick={() => setStatus("idle")} className="mt-4">
              Send Another
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Your Name</label>
              <Input
                name="name"
                placeholder="Enter your name"
                required
                className="bg-secondary/50 border-border/50 h-12 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-secondary/50 border-border/50 h-12 focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Message</label>
              <Textarea
                name="message"
                placeholder="Share your feedback, suggestions, or ideas..."
                required
                rows={5}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                Something went wrong. Please try again.
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Message
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
