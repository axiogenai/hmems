import React from "react";
import { Bell, Send, User, MessageSquare } from "lucide-react";
import { Announcement } from "@/types/parent-portal";

interface Contact {
  id: string;
  name: string;
  subject: string;
  initial: string;
}

interface ChatMessage {
  sender: "parent" | "teacher";
  text: string;
  time: string;
}

interface CommunicationsTabProps {
  announcements: Announcement[];
  unreadCount: number;
  selectedContact: Contact | null;
  chatContacts: Contact[];
  chatMessages: Record<string, ChatMessage[]>;
  messageText: string;
  onSendMessage: (e: React.FormEvent) => void;
  onChangeMessageText: (text: string) => void;
  onSelectContact: (contact: Contact) => void;
  onMarkAnnouncementRead: (id: string) => void;
}

export function CommunicationsTab({
  announcements,
  unreadCount,
  selectedContact,
  chatContacts,
  chatMessages,
  messageText,
  onSendMessage,
  onChangeMessageText,
  onSelectContact,
  onMarkAnnouncementRead,
}: CommunicationsTabProps) {
  const currentMessages = selectedContact ? (chatMessages[selectedContact.id] || []) : [];

  return (
    <div className="space-y-6">
      {/* Announcements */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Bell className="text-accent" size={20} />
          Broadcast Board
        </h3>
        {announcements.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No broadcast announcements.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => onMarkAnnouncementRead(a.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                  !a.read
                    ? "bg-accent/100/5 border-accent bg-accent/5"
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  a.priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                }`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">{a.title}</h4>
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase shrink-0 mt-0.5">{a.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.content}</p>
                  {!a.read && (
                    <span className="inline-block text-[8px] font-bold bg-accent text-white px-2 py-0.5 rounded-full mt-2">
                      New notice
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Messaging with Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[450px]">
        {/* Contacts Directory */}
        <div className="border-r border-slate-100 p-4 bg-slate-50/50 flex flex-col">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 px-2">
            Class Teachers Directory
          </h4>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {chatContacts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No assigned teachers found.</p>
            ) : (
              chatContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 border text-left transition-all cursor-pointer ${
                    selectedContact && selectedContact.id === contact.id
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "bg-white border-slate-200/60 hover:border-primary/50 text-slate-800"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                    selectedContact && selectedContact.id === contact.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {contact.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate">{contact.name}</p>
                    <p className={`text-[10px] truncate ${
                      selectedContact && selectedContact.id === contact.id ? "text-white/70" : "text-slate-400"
                    }`}>
                      {contact.subject}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messaging Box */}
        <div className="md:col-span-2 flex flex-col h-[450px] md:h-auto">
          {!selectedContact ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-center space-y-3">
              <MessageSquare size={36} className="text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Teacher Selected</p>
              <p className="text-xs max-w-xs">Select a teacher from the directory panel to begin direct messaging.</p>
            </div>
          ) : (
            <>
              {/* Box Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {selectedContact.initial}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{selectedContact.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedContact.subject} · Class Teacher</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(`Respected ${selectedContact.name}, regarding my child's performance in ${selectedContact.subject}...`);
                    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>💬</span> WhatsApp
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {currentMessages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10 font-medium">Send a message to start conversation.</p>
                ) : (
                  currentMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === "parent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm border ${
                          msg.sender === "parent"
                            ? "bg-primary border-primary text-white rounded-tr-none"
                            : "bg-white border-slate-200 text-slate-700 rounded-tl-none"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-[8px] text-right mt-1.5 font-medium ${
                          msg.sender === "parent" ? "text-white/60" : "text-slate-400"
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Messages Input Footer */}
              <form onSubmit={onSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => onChangeMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-primary hover:bg-primary-light text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
