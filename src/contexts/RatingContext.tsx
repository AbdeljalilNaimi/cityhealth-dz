import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

export type RatingActionType = 'appointment' | 'call' | 'route';

interface RatingTrigger {
  actionType: RatingActionType;
  providerId: string;
  providerName: string;
  sessionKey: string;
}

interface RatingContextValue {
  trigger: RatingTrigger | null;
  isVisible: boolean;
  triggerRating: (actionType: RatingActionType, providerId: string, providerName: string) => void;
  dismissRating: () => void;
}

const RatingContext = createContext<RatingContextValue | null>(null);

function buildSessionKey(actionType: RatingActionType, providerId: string) {
  return `rating_shown_${actionType}_${providerId}`;
}

export function RatingProvider({ children }: { children: ReactNode }) {
  const [trigger, setTrigger] = useState<RatingTrigger | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissRating = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setTrigger(null), 400);
  }, []);

  const triggerRating = useCallback(
    (actionType: RatingActionType, providerId: string, providerName: string) => {
      const key = buildSessionKey(actionType, providerId);
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');

      if (timerRef.current) clearTimeout(timerRef.current);

      const delay = 1000 + Math.random() * 1000;
      timerRef.current = setTimeout(() => {
        setTrigger({ actionType, providerId, providerName, sessionKey: key });
        setIsVisible(true);
      }, delay);
    },
    []
  );

  return (
    <RatingContext.Provider value={{ trigger, isVisible, triggerRating, dismissRating }}>
      {children}
    </RatingContext.Provider>
  );
}

export function useRating() {
  const ctx = useContext(RatingContext);
  if (!ctx) throw new Error('useRating must be used within RatingProvider');
  return ctx;
}
