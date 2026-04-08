import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, X } from "lucide-react";

export function IdleReminder() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let timeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimer = () => {
      lastActivity = Date.now();
      setShow(false);
    };

    const checkIdle = () => {
      if (Date.now() - lastActivity > 5 * 60 * 1000) {
        setShow(true);
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    const interval = setInterval(checkIdle, 30000);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-card border-primary/30 p-4 px-6 flex items-center gap-3 shadow-xl"
        >
          <Coffee className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm">Still here? Start a focus session to stay productive!</p>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-secondary/50 rounded">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
