import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export function useBlockedDates(type: "resort" | "event" | "turf") {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    fetchBlockedDates();
  }, [type]);

  const fetchBlockedDates = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("date")
      .eq("type", type)
      .in("status", ["pending", "confirmed", "paid"]);

    if (!error && data) {
      const dates = data.map((b) => b.date);
      setBlockedDates(dates);
    }
  };

  const isDateBlocked = (date: string) => {
    return blockedDates.includes(date);
  };

  return { isDateBlocked };
}