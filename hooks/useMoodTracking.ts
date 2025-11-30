"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface MoodMetrics {
  typingSpeed: number; // chars per second
  scrollVelocity: number; // pixels per second
  rageClicks: number; // count
  backspaceCount: number; // count
}

export function useMoodTracking(userId?: string, tripId?: string) {
  const pathname = usePathname();
  const metricsRef = useRef<MoodMetrics>({
    typingSpeed: 0,
    scrollVelocity: 0,
    rageClicks: 0,
    backspaceCount: 0,
  });

  // Tracking state
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const keyPressCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!userId) return;

    const handleScroll = () => {
      const now = Date.now();
      const currentScrollY = window.scrollY;
      const timeDiff = now - lastScrollTime.current;
      
      if (timeDiff > 100) { // Sample every 100ms
        const distance = Math.abs(currentScrollY - lastScrollY.current);
        const velocity = (distance / timeDiff) * 1000; // px/sec
        
        // Simple moving average or max retention
        metricsRef.current.scrollVelocity = Math.max(metricsRef.current.scrollVelocity, velocity);
        
        lastScrollY.current = currentScrollY;
        lastScrollTime.current = now;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressCount.current++;
      if (e.key === "Backspace") {
        metricsRef.current.backspaceCount++;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (e.detail >= 3) { // 3 clicks in short succession
        metricsRef.current.rageClicks++;
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleClick);

    // Periodic reporting (every 30 seconds or on unmount)
    const reportInterval = setInterval(() => {
      sendMoodReport();
    }, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleClick);
      clearInterval(reportInterval);
      sendMoodReport(); // Send final report on unmount/change
    };
  }, [userId, pathname]);

  const sendMoodReport = async () => {
    const now = Date.now();
    const durationSec = (now - startTime.current) / 1000;
    
    if (durationSec < 1) return;

    // Calculate final rates
    const currentMetrics = {
      ...metricsRef.current,
      typingSpeed: keyPressCount.current / durationSec,
    };

    // Only send if there's significant activity
    if (currentMetrics.scrollVelocity > 0 || currentMetrics.typingSpeed > 0 || currentMetrics.rageClicks > 0) {
      try {
        // We need a dayPlanId if we are on a specific trip page, but for now we might just send tripId
        // The API handles optional dayPlanId
        await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            tripId,
            metrics: currentMetrics,
          }),
        });
        
        // Reset metrics after send
        metricsRef.current = {
            typingSpeed: 0,
            scrollVelocity: 0,
            rageClicks: 0,
            backspaceCount: 0,
        };
        keyPressCount.current = 0;
        startTime.current = Date.now();
        
      } catch (err) {
        console.error("Failed to send mood report", err);
      }
    }
  };
}
