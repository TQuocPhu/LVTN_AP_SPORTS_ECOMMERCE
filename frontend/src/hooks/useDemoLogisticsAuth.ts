"use client";

import { useDemoLogisticsAuth as useDemoLogisticsAuthFromContext } from "@/context/DemoLogisticsAuthContext";

export function useDemoLogisticsAuth() {
  return useDemoLogisticsAuthFromContext();
}
