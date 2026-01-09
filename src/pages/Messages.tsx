import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Send, ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { useRole } from "@/contexts/RoleContext";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const { user } = useAuth();
  const { activeRole } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  const { conversations, loading: conversationsLoading } = useConversations();
  const { messages, sendMessage, loading: messagesLoading } = useMessages(selectedConversation);

  // Handle URL parameter for direct conversation access
  useEffect(() => {
    const conversationParam = searchParams.get("conversation");
    if (conversationParam && conversations.length > 0) {
      setSelectedConversation(conversationParam);
    }
  }, [searchParams, conversations]);

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    const { error } = await sendMessage(messageInput);
    if (!error) {
      setMessageInput("");
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setSearchParams({ conversation: conversationId });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-0 md:px-4 py-0 md:py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 px-4 md:px-0 pt-6 md:pt-0 hidden md:block">Messages</h1>
        
        <div className="bg-card md:border md:rounded-xl md:shadow-card overflow-hidden h-[calc(100vh-64px)] md:h-[700px] flex">
          {/* Conversations List */}
          <div className={cn(
            "w-full md:w-96 lg:w-[420px] border-r border-border flex flex-col bg-background",
            selectedConversation && "hidden md:flex"
          )}>
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {activeRole === 'host' 
                    ? "No messages yet. Explorers will reach out when interested in your services!"
                    : "No conversations yet. Start chatting with a guide!"
                  }
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={cn(
                      "w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors border-b border-border text-left",
                      selectedConversation === conversation.id && "bg-accent"
                    )}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={conversation.other_user_avatar} />
                      <AvatarFallback>{conversation.other_user_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{conversation.other_user_name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mb-1 truncate">
                        {conversation.service_title || "General chat"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3 bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden flex-shrink-0"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={currentConversation?.other_user_avatar} />
                  <AvatarFallback>
                    {currentConversation?.other_user_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold truncate">{currentConversation?.other_user_name}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentConversation?.service_title || "Chat"}
                  </p>
                </div>
              </div>

              {/* Experience Card - Pinned at top */}
              {currentConversation && currentConversation.service_id && (
                <div className="p-4 pb-0 border-b border-border bg-background">
                  <div className="max-w-3xl mx-auto">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <Link 
                          to={`/experience/${currentConversation.service_id}`}
                          className="flex gap-4 p-4 hover:bg-accent transition-colors"
                        >
                          <img 
                            src={currentConversation.service_image || "/placeholder.svg"} 
                            alt={currentConversation.service_title || "Service"}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 truncate">
                              {currentConversation.service_title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              ${currentConversation.service_price} per session
                            </p>
                            <div className="flex items-center gap-1 text-sm text-primary">
                              <span>View details</span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Messages - Scrollable */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-2",
                          message.sender_id === user?.id && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.sender_avatar} />
                          <AvatarFallback className="text-xs">
                            {message.sender_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "flex flex-col max-w-[70%]",
                            message.sender_id === user?.id && "items-end"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5",
                              message.sender_id === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 px-1">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2 max-w-3xl mx-auto">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
              <div className="text-center max-w-md">
                <div className="mb-4">
                  <Send className="h-16 w-16 mx-auto text-muted-foreground/50" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Your messages</h2>
                <p className="text-muted-foreground">
                  {activeRole === 'host'
                    ? "Select a conversation from the list to view messages from explorers"
                    : "Select a conversation from the list to start chatting with your guide"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
