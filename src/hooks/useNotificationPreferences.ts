import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_bookings: boolean;
  email_messages: boolean;
  email_reminders: boolean;
  email_marketing: boolean;
  push_enabled: boolean;
  timezone: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const table = useMemo(() => {
    // Cast to avoid generated DB types lagging behind new migrations
    return supabase.from("notification_preferences" as any);
  }, []);

  const ensureRow = useCallback(async (): Promise<NotificationPreferences | null> => {
    if (!user) return null;

    // Try fetch
    const { data, error } = await table.select("*").eq("user_id", user.id).maybeSingle();

    if (!error && data) return data as unknown as NotificationPreferences;

    // Not found -> create defaults
    if (error?.code === "PGRST116" || data === null) {
      const { data: created, error: insertError } = await table
        .insert({ user_id: user.id })
        .select("*")
        .single();

      if (insertError) throw insertError;
      return created as unknown as NotificationPreferences;
    }

    throw error;
  }, [table, user]);

  const refetch = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const row = await ensureRow();
      setPreferences(row);
    } catch (err: any) {
      console.error("Error loading notification preferences:", err);
      toast.error("Could not load notification settings");
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  }, [ensureRow, user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updatePreference = useCallback(
    async (key: keyof Omit<NotificationPreferences, "id" | "user_id">, value: boolean | string) => {
      if (!user) return;

      try {
        const current = preferences ?? (await ensureRow());
        if (!current) return;

        const { data, error } = await table
          .update({ [key]: value })
          .eq("user_id", user.id)
          .select("*")
          .single();

        if (error) throw error;

        setPreferences(data as unknown as NotificationPreferences);
        toast.success("Settings saved");
      } catch (err: any) {
        console.error("Error updating preference:", err);
        toast.error("Failed to save settings");
      }
    },
    [ensureRow, preferences, table, user]
  );

  return { preferences, loading, updatePreference, refetch };
};
