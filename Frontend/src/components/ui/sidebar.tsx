"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";
import { cn } from "@/lib/utils";

type Links = {
  label: string;
  href: string;
  icon: ReactNode;
};

type SidebarContextProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  animate: boolean;
};

type SidebarProviderProps = {
  children: ReactNode;
  open?: boolean | undefined;
  setOpen?: Dispatch<SetStateAction<boolean>> | undefined;
  animate?: boolean;
};

type SidebarProps = SidebarProviderProps;

type SidebarBodyProps = React.ComponentProps<"div">;

type DesktopSidebarProps = React.ComponentProps<"aside">;

type MobileSidebarProps = React.ComponentProps<"div">;

type SidebarLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  link: Links;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

export function SidebarProvider({
  children,
  open: controlledOpen,
  setOpen: setControlledOpen,
  animate = true
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const value = useMemo(
    () => ({ open, setOpen, animate }),
    [animate, open, setOpen]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function Sidebar({
  children,
  open,
  setOpen,
  animate = true
}: SidebarProps) {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      <DesktopSidebar>{children}</DesktopSidebar>
    </SidebarProvider>
  );
}

export function SidebarBody({ className, ...props }: SidebarBodyProps) {
  return (
    <div
      className={cn("flex h-full flex-col overflow-hidden px-2.5 py-4", className)}
      {...props}
    />
  );
}

export function DesktopSidebar({
  className,
  onMouseEnter,
  onMouseLeave,
  style,
  ...props
}: DesktopSidebarProps) {
  const { open, setOpen, animate } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] lg:flex",
        className
      )}
      style={{
        width: open ? 216 : 76,
        transition: animate
          ? "width 280ms cubic-bezier(0.22, 1, 0.36, 1)"
          : undefined,
        willChange: animate ? "width" : undefined,
        ...style
      }}
      onMouseEnter={(event) => {
        setOpen(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setOpen(false);
        onMouseLeave?.(event);
      }}
      {...props}
    />
  );
}

export function MobileSidebar({ className, ...props }: MobileSidebarProps) {
  return <div className={cn("lg:hidden", className)} {...props} />;
}

export function SidebarLink({
  link,
  className,
  children,
  ...props
}: SidebarLinkProps) {
  const { open, animate } = useSidebar();

  return (
    <a
      href={link.href}
      className={cn(
        "group/sidebar-link flex min-h-10 items-center rounded-xl text-sm font-bold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2",
        open ? "justify-start gap-2 px-2" : "justify-center px-0",
        className
      )}
      {...props}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors">
        {link.icon}
      </span>
      <span
        className={cn(
          "min-w-0 whitespace-pre transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          animate
            ? open
              ? "max-w-40 translate-x-0 opacity-100"
              : "max-w-0 -translate-x-1 overflow-hidden opacity-0"
            : open
              ? "max-w-40 opacity-100"
              : "max-w-0 overflow-hidden opacity-0"
        )}
      >
        {children ?? link.label}
      </span>
    </a>
  );
}

function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be used inside <Sidebar>.");
  }

  return context;
}
