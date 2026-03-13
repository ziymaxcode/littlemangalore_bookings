import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export function useBlockedDates(type: "resort" | "event" | "turf") {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    if (type !== "turf") {
      fetchBlockedDates();
    }
  }, [type]);

  const fetchBlockedDates = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("date")
      .in("type", ["resort", "event"])
      .in("status", ["pending", "confirmed", "paid"]);

    if (!error && data) {
      const dates = data.map((b) => b.date);
      setBlockedDates(dates);
    }
  };

  const isDateBlocked = (date: string) => {
    if (type === "turf") return false; // turf never blocks whole day
    return blockedDates.includes(date);
  };

  return { isDateBlocked };
}