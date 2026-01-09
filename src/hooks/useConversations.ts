import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  service_id?: string;
  booking_id?: string;
  last_message_at: string;
  created_at: string;
  // Generic "other user" fields (the person you're chatting with)
  other_user_id?: string;
  other_user_name?: string;
  other_user_avatar?: string;
  // Specific role fields
  guide_id?: string;
  guide_name?: string;
  guide_avatar?: string;
  explorer_id?: string;
  explorer_name?: string;
  explorer_avatar?: string;
  // Service fields
  service_title?: string;
  service_image?: string;
  service_price?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Subscribe to new messages
      const channel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `participant_1_id=eq.${user.id},participant_2_id=eq.${user.id}`
          },
          () => fetchConversations()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          participant_1:participant_1_id(id, full_name, avatar_url),
          participant_2:participant_2_id(id, full_name, avatar_url),
          service:service_id(id, title, image_urls, price, currency, guide_id)
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((conv: any) => {
        const isParticipant1 = conv.participant_1_id === user.id;
        const otherUser = isParticipant1 ? conv.participant_2 : conv.participant_1;
        const guideId = conv.service?.guide_id;
        
        // Determine who is the guide and who is the explorer
        const isCurrentUserGuide = guideId === user.id;
        
        return {
          ...conv,
          // Generic "other user" - the person you're chatting with
          other_user_id: otherUser?.id,
          other_user_name: otherUser?.full_name || "Unknown",
          other_user_avatar: otherUser?.avatar_url,
          // Specific role fields for backward compatibility and additional context
          guide_id: guideId,
          guide_name: isCurrentUserGuide ? user.email : otherUser?.full_name,
          guide_avatar: isCurrentUserGuide ? undefined : otherUser?.avatar_url,
          explorer_name: isCurrentUserGuide ? otherUser?.full_name : user.email,
          explorer_avatar: isCurrentUserGuide ? otherUser?.avatar_url : undefined,
          // Service fields
          service_title: conv.service?.title,
          service_image: conv.service?.image_urls?.[0],
          service_price: conv.service?.price,
        };
      });

      setConversations(formatted);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (
    otherUserId: string,
    serviceId?: string
  ) => {
    if (!user) return { data: null, error: "Not authenticated" };

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`
        )
        .eq("service_id", serviceId || "")
        .maybeSingle();

      if (existing) {
        return { data: existing, error: null };
      }

      // Create new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: user.id,
          participant_2_id: otherUserId,
          service_id: serviceId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return { data, error: null };
    } catch (err: any) {
      console.error("Error creating conversation:", err);
      return { data: null, error: err.message };
    }
  };

  return {
    conversations,
    loading,
    error,
    createConversation,
    refetch: fetchConversations,
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId && user) {
      fetchMessages();

      // Subscribe to new messages
      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId, user]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id(id, full_name, avatar_url)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formatted = (data || []).map((msg: any) => ({
        ...msg,
        sender_name: msg.sender?.full_name || "Unknown",
        sender_avatar: msg.sender?.avatar_url,
      }));

      setMessages(formatted);

      // Mark messages as read
      if (user) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id)
          .eq("is_read", false);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return { data: null, error: "Invalid message" };

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      return { data, error: null };
    } catch (err: any) {
      console.error("Error sending message:", err);
      return { data: null, error: err.message };
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
};
