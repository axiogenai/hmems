import React, { useState, useMemo } from "react";
import { Mail, Send, Search, Bell, Sparkles } from "lucide-react";
import { Broadcast, BroadcastTemplate } from "@/types/admin";

interface CommunicationsTabProps {
  broadcasts: Broadcast[];
  templates: BroadcastTemplate[];
  onSendBroadcast: (target: "all" | "parents" | "teachers", msg: string) => void;
  broadcastSuccess: boolean;
}

export function CommunicationsTab({
  broadcasts,
  templates,
  onSendBroadcast,
  broadcastSuccess,
}: CommunicationsTabProps) {
  const [target, setTarget] = useState<"all" | "parents" | "teachers">("all");
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendBroadcast(target, message.trim());
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tid = e.target.value;
    setSelectedTemplateId(tid);
    if (!tid) {
      setMessage("");
      return;
    }
    const template = templates.find((t) => t.id === tid);
    if (template) {
      setMessage(template.body);
    }
  };

  // Reset message text upon successful transmit callback
  React.useEffect(() => {
    if (broadcastSuccess) {
      setMessage("");
      setSelectedTemplateId("");
    }
  }, [broadcastSuccess]);

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => b.message.toLowerCase().includes(search.toLowerCase()));
  }, [broadcasts, search]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Sender Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <Mail size={18} className="text-accent" />
            Send System Broadcast
          </h3>

          {broadcastSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl font-semibold mb-4 text-center">
              ✓ System broadcast transmitted. SMS & email dispatches generated.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comm-target" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Stakeholders
              </label>
              <select
                id="comm-target"
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
              >
                <option value="all">All Stakeholders (Parents & Teachers)</option>
                <option value="parents">Parents Only</option>
                <option value="teachers">Teachers Only</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="comm-template" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Template Auto-Fill (Optional)
                </label>
                <span className="text-[9px] font-extrabold text-accent flex items-center gap-0.5 uppercase tracking-wider">
                  <Sparkles size={10} /> Smart Templates
                </span>
              </div>
              <select
                id="comm-template"
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
              >
                <option value="">-- Choose Preset Message --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="comm-msg" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Alert Message Body
              </label>
              <textarea
                id="comm-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type notice updates..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none resize-none placeholder-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-accent text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={13} /> Transmit Broadcast Dispatches
            </button>
          </form>
        </div>

        {/* Broadcast logs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-slate-800 text-base">Broadcast Audit Logs</h3>
              <div className="relative max-w-xs w-full">
                <Search size={13} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alert description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[350px] pr-1">
              {filteredBroadcasts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No broadcasts dispatched.</p>
              ) : (
                filteredBroadcasts.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 space-y-1.5 flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                      <Bell size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                        <span>Target: {b.target}</span>
                        <span>{new Date(b.sentAt).toLocaleDateString("en-IN")}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mt-1 leading-relaxed">{b.message}</p>
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mt-2">
                        <span>Dispatched to {b.recipients} users</span>
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
