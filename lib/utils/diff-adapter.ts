// import { Activity } from "@/types/itinerary"; // Type not found, using any for flexibility or define locally if needed

export type DiffStatus = "added" | "removed" | "modified" | "unchanged";

export interface DiffRow {
  time: string;
  original?: any; // Using any for now to match the component's flexible input, but should be Activity
  new?: any;
  status: DiffStatus;
}

export function calculateItineraryDiff(originalActivities: any[], newActivities: any[]): DiffRow[] {
  const timeMap = new Set<string>();
  const originalMap = new Map<string, any>();
  const newMap = new Map<string, any>();

  // Index by time
  originalActivities.forEach(a => {
    timeMap.add(a.time);
    originalMap.set(a.time, a);
  });
  newActivities.forEach(a => {
    timeMap.add(a.time);
    newMap.set(a.time, a);
  });

  // Sort times
  const sortedTimes = Array.from(timeMap).sort((a, b) => a.localeCompare(b));

  return sortedTimes.map(time => {
    const original = originalMap.get(time);
    const newItem = newMap.get(time);

    let status: DiffStatus = "unchanged";

    if (original && !newItem) {
      status = "removed";
    } else if (!original && newItem) {
      status = "added";
    } else if (original && newItem) {
      // Simple equality check (can be expanded)
      const isSame = original.title === newItem.title && 
                     original.description === newItem.description;
      status = isSame ? "unchanged" : "modified";
    }

    return {
      time,
      original,
      new: newItem,
      status
    };
  });
}
