import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export function useBlockedDates(type: "resort" | "event" | "turf") {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    fetchBlockedDates();
  }, [type]);

  const fetchBlockedDates = async () => {
    // 1. Get confirmed bookings (existing logic)
    const { data: bookings } = await supabase
      .from("bookings")
      .select("date")
      .in("type", ["resort", "event"])
      .in("status", ["pending", "confirmed", "paid"]);

    // 2. Get manual admin blocks (the missing piece!)
    const { data: adminBlocks } = await supabase
      .from("blocked_dates")
      .select("date");

    const bookingDates = bookings?.map((b) => b.date) || [];
    const manualDates = adminBlocks?.map((b) => b.date) || [];

    // Combine both arrays into one unique list
    setBlockedDates([...new Set([...bookingDates, ...manualDates])]);
  };

  const isDateBlocked = (date: string) => {
    // Even for Turf, we should check if the Admin has blocked the WHOLE day (maintenance, etc.)
    return blockedDates.includes(date);
  };

  return { isDateBlocked };
}