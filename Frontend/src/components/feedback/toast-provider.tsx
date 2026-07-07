"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  OctagonAlert,
  X
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "warning" | "danger" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastMessage = ToastInput & {
  id: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
};

type ToastProviderProps = {
  children: ReactNode;
};

const TOAST_DURATION_MS = 5200;
const MAX_VISIBLE_TOASTS = 4;
const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<
  ToastTone,
  {
    border: string;
    icon: string;
    title: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    border: "border-[var(--green-soft)]",
    icon: "bg-[var(--green-soft)] text-[var(--teal-strong)]",
    title: "text-[var(--teal-strong)]",
    Icon: CheckCircle2
  },
  warning: {
    border: "border-[var(--orange-soft)]",
    icon: "bg-[var(--orange-soft)] text-[var(--orange-strong)]",
    title: "text-[var(--orange-strong)]",
    Icon: AlertTriangle
  },
  danger: {
    border: "border-[var(--danger-soft)]",
    icon: "bg-[var(--danger-soft)] text-[var(--danger)]",
    title: "text-[var(--danger)]",
    Icon: OctagonAlert
  },
  info: {
    border: "border-[var(--blue-soft)]",
    icon: "bg-[var(--blue-soft)] text-[var(--blue-strong)]",
    title: "text-[var(--blue-strong)]",
    Icon: Info
  }
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounter = useRef(0);
  const timers = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((currentToasts) =>
      currentToasts.filter((toastMessage) => toastMessage.id !== id)
    );
  }, []);

  const toast = useCallback(
    ({ tone = "info", ...input }: ToastInput) => {
      toastCounter.current += 1;
      const id = `toast-${Date.now()}-${toastCounter.current}`;
      const nextToast: ToastMessage = { ...input, id, tone };

      setToasts((currentToasts) =>
        [nextToast, ...currentToasts].slice(0, MAX_VISIBLE_TOASTS)
      );

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);
      timers.current.set(id, timer);
    },
    [dismissToast]
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    []
  );

  const contextValue = useMemo(
    () => ({ dismissToast, toast }),
    [dismissToast, toast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions removals"
        className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-[380px]"
      >
        {toasts.map((toastMessage) => (
          <ToastCard
            key={toastMessage.id}
            toastMessage={toastMessage}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }

  return context;
}

function ToastCard({
  toastMessage,
  onDismiss
}: {
  toastMessage: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const styles = toneStyles[toastMessage.tone];
  const { Icon } = styles;

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border bg-[var(--panel)] p-3 text-left shadow-[var(--shadow-soft)]",
        styles.border
      )}
      role={toastMessage.tone === "danger" ? "alert" : "status"}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          styles.icon
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-extrabold", styles.title)}>
          {toastMessage.title}
        </p>
        {toastMessage.description ? (
          <p className="mt-1 text-sm font-semibold leading-5 text-[var(--muted-strong)]">
            {toastMessage.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label={`Dismiss ${toastMessage.title}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--panel-muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2"
        onClick={() => onDismiss(toastMessage.id)}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
