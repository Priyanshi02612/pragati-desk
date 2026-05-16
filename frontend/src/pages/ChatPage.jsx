import { MessageSquare, Search, SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const formatMessageTime = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const ChatPage = () => {
  const {
    chatContacts,
    chatMessages,
    conversations,
    createConversation,
    currentUser,
    loadConversationMessages,
    markChatConversationRead,
    sendChatMessage,
  } = useAppContext();
  const [activeConversationId, setActiveConversationId] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!activeConversationId && conversations.length) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    loadConversationMessages(activeConversationId).catch(() => null);
    markChatConversationRead(activeConversationId).catch(() => null);
  }, [activeConversationId]);

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ||
      null,
    [activeConversationId, conversations],
  );

  const activeMessages = activeConversation
    ? chatMessages[activeConversation.id] || []
    : [];

  const availableContacts = useMemo(() => {
    const existingIds = new Set(
      conversations.map((conversation) => conversation.counterpart?.id).filter(Boolean),
    );

    return chatContacts.filter((contact) => !existingIds.has(contact.id));
  }, [chatContacts, conversations]);

  const handleStartConversation = async (participantId) => {
    const conversation = await createConversation(participantId);
    setActiveConversationId(conversation.id);
    await loadConversationMessages(conversation.id).catch(() => null);
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!draft.trim() || !activeConversation) {
      return;
    }

    setIsSending(true);

    try {
      await sendChatMessage(activeConversation.id, draft);
      setDraft("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <Card className="p-0">
        <div className="border-b border-brand-border/60 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Collaboration
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-brand-text">Team Chat</h1>
          <p className="mt-2 text-sm text-brand-muted">
            Real-time conversations across admins, team leaders, and employees.
          </p>
        </div>

        <div className="border-b border-brand-border/60 px-5 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-brand-primarySoft px-4 py-3 text-sm text-brand-muted">
            <Search size={16} className="text-brand-primary" />
            Browse recent chats and start a new one below.
          </div>
        </div>

        <div className="max-h-[360px] overflow-y-auto px-3 py-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Conversations
          </p>
          <div className="space-y-2">
            {conversations.length ? (
              conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const counterpart = conversation.counterpart;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
                      isActive
                        ? "bg-brand-primary text-white shadow-card"
                        : "bg-white hover:bg-brand-primarySoft/70"
                    }`}
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <Avatar
                      src={counterpart?.avatar}
                      name={counterpart?.name || "Teammate"}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold">
                          {counterpart?.name || "Teammate"}
                        </p>
                        <span
                          className={`shrink-0 text-xs ${
                            isActive ? "text-white/75" : "text-brand-muted"
                          }`}
                        >
                          {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p
                        className={`mt-1 truncate text-sm ${
                          isActive ? "text-white/80" : "text-brand-muted"
                        }`}
                      >
                        {conversation.lastMessageText || "Conversation started"}
                      </p>
                    </div>
                    {conversation.unreadCount ? (
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-brand-secondary text-white"
                        }`}
                      >
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface px-4 py-5 text-sm text-brand-muted">
                No conversations yet. Start with someone from your team.
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-brand-border/60 px-3 py-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
            Start a new chat
          </p>
          <div className="max-h-[240px] space-y-2 overflow-y-auto">
            {availableContacts.length ? (
              availableContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-brand-primarySoft/70"
                  onClick={() => handleStartConversation(contact.id)}
                >
                  <Avatar src={contact.avatar} name={contact.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-text">
                      {contact.name}
                    </p>
                    <p className="truncate text-xs text-brand-muted">
                      {contact.role} • {contact.department}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface px-4 py-4 text-sm text-brand-muted">
                Everyone available already has a conversation.
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="flex min-h-[720px] flex-col overflow-hidden p-0">
        {activeConversation ? (
          <>
            <div className="flex items-center gap-4 border-b border-brand-border/60 px-6 py-5">
              <Avatar
                src={activeConversation.counterpart?.avatar}
                name={activeConversation.counterpart?.name || "Teammate"}
                size="md"
              />
              <div>
                <h2 className="text-lg font-semibold text-brand-text">
                  {activeConversation.counterpart?.name || "Teammate"}
                </h2>
                <p className="text-sm text-brand-muted">
                  {activeConversation.counterpart?.role} •{" "}
                  {activeConversation.counterpart?.department}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(232,238,251,0.28)_0%,rgba(251,253,254,0.88)_100%)] px-6 py-5">
              {activeMessages.length ? (
                activeMessages.map((message) => {
                  const isMine = message.senderId === currentUser.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-3xl px-4 py-3 shadow-sm ${
                          isMine
                            ? "bg-brand-primary text-white"
                            : "border border-brand-border/60 bg-white text-brand-text"
                        }`}
                      >
                        <p className="text-sm leading-6">{message.content}</p>
                        <p
                          className={`mt-2 text-xs ${
                            isMine ? "text-white/75" : "text-brand-muted"
                          }`}
                        >
                          {isMine ? "You" : message.sender?.name} •{" "}
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-brand-border bg-white/80 px-6 py-10 text-center text-brand-muted">
                  No messages yet. Send the first one to get the conversation moving.
                </div>
              )}
            </div>

            <form
              className="border-t border-brand-border/60 bg-white px-6 py-5"
              onSubmit={handleSend}
            >
              <div className="flex items-end gap-3">
                <textarea
                  className="min-h-[88px] flex-1 rounded-3xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text shadow-sm transition focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <Button
                  type="submit"
                  className="h-[52px] gap-2 px-5"
                  disabled={isSending || !draft.trim()}
                >
                  Send
                  <SendHorizontal size={16} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primarySoft text-brand-primary">
              <MessageSquare size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-brand-text">
                Choose a conversation
              </h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-brand-muted">
                Pick an existing conversation or start a new one from the left to
                begin chatting with your team.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
