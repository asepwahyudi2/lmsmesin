"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { User, Role } from "./types";

interface AppState {
  currentUser: User | null;
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const t = setTimeout(() => {
      if (session?.user) {
        const sessionUser: User = {
          id: session.user.id,
          name: session.user.name || "User",
          email: session.user.email || undefined,
          role: (session.user.role as Role) || "Murid",
          avatar: session.user.name?.substring(0, 2).toUpperCase() || "U",
        };
        setCurrentUser(sessionUser);
      } else {
        setCurrentUser(null);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [session]);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
