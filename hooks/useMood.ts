"use client";

import { useEffect, useRef, useState } from "react";

interface MoodMetrics {
  typingSpeed: number;
  scrollVelocity: number;
  clickHesitation: number;
  editFrequency: number;
  keyHesitationPattern: number[];
}

export function useMood(tripId?: string, dayPlanId?: string) {
  const [metrics, setMetrics] = useState<MoodMetrics>({
    typingSpeed: 0,
    scrollVelocity: 0,
    clickHesitation: 0,
    editFrequency: 0,
    keyHesitationPattern: [],
  });

  const keystrokeTimestamps = useRef<number[]>([]);
  const scrollTimestamps = useRef<{ time: number; position: number }[]>([]);
  const clickTimestamps = useRef<{ hover: number; click: number }[]>([]);
  const editCounts = useRef<number>(0);
  const lastSendTime = useRef<number>(Date.now());

  useEffect(() => {
    let keydownTime = 0;
    let hoverTime = 0;

    const handleKeyDown = () => {
      const now = Date.now();
      if (keydownTime > 0) {
        keystrokeTimestamps.current.push(now - keydownTime);
        if (keystrokeTimestamps.current.length > 20) {
          keystrokeTimestamps.current.shift();
        }
      }
      keydownTime = now;
    };

    const handleScroll = () => {
      const now = Date.now();
      const position = window.scrollY;
      scrollTimestamps.current.push({ time: now, position });
      if (scrollTimestamps.current.length > 10) {
        scrollTimestamps.current.shift();
      }
    };

    const handleMouseEnter = () => {
      hoverTime = Date.now();
    };

    const handleClick = () => {
      if (hoverTime > 0) {
        const now = Date.now();
        clickTimestamps.current.push({ hover: hoverTime, click: now });
        if (clickTimestamps.current.length > 10) {
          clickTimestamps.current.shift();
        }
        hoverTime = 0;
      }
    };

    const handleInput = () => {
      editCounts.current++;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("click", handleClick);
    document.addEventListener("input", handleInput);

    const interval = setInterval(() => {
      calculateMetrics();
    }, 10000);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("input", handleInput);
      clearInterval(interval);
    };
  }, []);

  const calculateMetrics = () => {
    const typingSpeed = keystrokeTimestamps.current.length > 0
      ? 1000 / (keystrokeTimestamps.current.reduce((a, b) => a + b, 0) / keystrokeTimestamps.current.length)
      : 0;

    let scrollVelocity = 0;
    if (scrollTimestamps.current.length >= 2) {
      const first = scrollTimestamps.current[0];
      const last = scrollTimestamps.current[scrollTimestamps.current.length - 1];
      const distance = Math.abs(last.position - first.position);
      const time = (last.time - first.time) / 1000;
      scrollVelocity = time > 0 ? distance / time : 0;
    }

    const clickHesitation = clickTimestamps.current.length > 0
      ? clickTimestamps.current.reduce((sum, item) => sum + (item.click - item.hover), 0) / clickTimestamps.current.length
      : 0;

    const editFrequency = editCounts.current / ((Date.now() - lastSendTime.current) / 60000);

    const newMetrics = {
      typingSpeed,
      scrollVelocity,
      clickHesitation,
      editFrequency,
      keyHesitationPattern: [...keystrokeTimestamps.current],
    };

    setMetrics(newMetrics);

    if (Date.now() - lastSendTime.current > 30000) {
      sendMoodData(newMetrics);
      lastSendTime.current = Date.now();
      editCounts.current = 0;
    }
  };

  const sendMoodData = async (metricsData: MoodMetrics) => {
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          dayPlanId,
          metrics: metricsData,
        }),
      });
    } catch (error) {
      console.error("Failed to send mood data:", error);
    }
  };

  return { metrics };
}
