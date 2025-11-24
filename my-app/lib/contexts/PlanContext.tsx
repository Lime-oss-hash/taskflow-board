"use client";

import { createContext, useContext } from "react";

interface PlanContextType {
  isFreeUser: boolean;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: React.ReactNode;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
}

export const PlanProvider = ({
  children,
  hasProPlan,
  hasEnterprisePlan,
}: PlanProviderProps) => {
  return (
    <PlanContext.Provider
      value={{
        isFreeUser: !hasProPlan && !hasEnterprisePlan,
        hasProPlan,
        hasEnterprisePlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};
