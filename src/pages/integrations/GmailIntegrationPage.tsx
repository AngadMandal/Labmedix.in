import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  FileText, 
  Search, 
  Sparkles,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { GmailService, GmailMessageItem, GmailProfile } from '../../services/gmailService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const GmailIntegrationPage: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('label:INBOX');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Compose State
  const [recipient, setRecipient] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const loadGmailData = async () => {
    setIsLoading(true);
    try {
      const prof = await GmailService.fetchProfile();
      const msgs = await GmailService.listMessages(undefined, searchQuery);
      setProfile(prof);
      setMessages(msgs);
      setIsConnected(true);
    } catch (error) {
      console.error(error);
      showToast('error', 'Gmail Connection Error', 'Failed to synchronize with Google Workspace Gmail API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGmailData();
  }, [searchQuery]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) {
      showToast('error', 'Missing Fields', 'Please fill in recipient email, subject, and message body.');
      return;
    }

    setIsSending(true);
    try {
      const success = await GmailService.sendEmail(undefined, recipient, subject, body);
      if (success) {
        showToast('success', 'Email Dispatched via Gmail API', `Successfully delivered to ${recipient}`);
        setRecipient('');
        setSubject('');
        setBody('');
        loadGmailData();
      } else {
        throw new Error('Send failed');
      }
    } catch (err) {
      showToast('error', 'Delivery Failed', 'Unable to transmit email through Google Workspace API.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSamplePrescription = async () => {
    setRecipient('patient.angad@labmedix.org');
    setSubject('[LabMedix AutoHealth] Official Clinical Prescription - Aarav Sharma');
    setBody('Dear Aarav Sharma,\n\nHere is your official digital prescription issued by Dr. Subhashish Roy.\nDiagnosis: Essential Hypertension\nRx: Amlodipine 5mg Daily\n\nStay healthy!\nLabMedix Clinical Operations');
    showToast('info', 'Prescription Template Loaded', 'Review fields and click Send Official Email.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 p-8 border border-red-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Mail className="w-48 h-48 text-red-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Google Workspace Gmail API Integration
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Gmail Clinical & Operations Hub
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Seamlessly dispatch official prescriptions, lab test reports, and administrative notifications directly through your authorized Google Workspace Gmail account (`angadmandal3@gmail.com`).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400">Connected Account</p>
                <p className="text-xs font-bold text-white">{profile?.emailAddress || 'angadmandal3@gmail.com'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={loadGmailData}
              disabled={isLoading}
              className="gap-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inbox / Messages & Compose */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Message Stream & Inbox */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gmail Message Stream</h3>
                  <p className="text-xs text-slate-400">Total messages: {profile?.messagesTotal || messages.length}</p>
                </div>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Gmail..." 
                  className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50"
                />
              </div>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No messages found matching query.</div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 hover:border-red-500/40 ${
                      msg.isUnread ? 'bg-slate-950/90 border-red-500/30 shadow-md' : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        {msg.isUnread && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                        <h4 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-sm">{msg.subject}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{msg.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium truncate mb-2">{msg.sender}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Compose & Dispatch Prescription Email */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Compose & Send Email</h3>
                  <p className="text-xs text-slate-400">Transmit via Google Workspace Gmail</p>
                </div>
              </div>
              <button 
                onClick={handleSendSamplePrescription}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/60 border border-red-500/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                Load Rx Template
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Recipient Email</label>
                <input 
                  type="email" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="patient@example.com" 
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Official Clinical Report / Prescription" 
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Message Body</label>
                <textarea 
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter clinical notes, prescription details, or notification text..."
                  required
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none font-mono"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSending}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transmitting via Gmail API...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Official Email
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
