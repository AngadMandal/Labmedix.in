import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import {
  Bot,
  Sparkles,
  Send,
  X,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Phone,
  TestTube,
  CreditCard,
  Truck,
  RotateCcw,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: Array<{ label: string; action: () => void }>;
}

interface AIVirtualHealthAssistantWidgetProps {
  onOpenCardApplication: (tier?: string) => void;
  onOpenLabBooking: () => void;
  onCallAmbulance: () => void;
}

export const AIVirtualHealthAssistantWidget: React.FC<AIVirtualHealthAssistantWidgetProps> = ({
  onOpenCardApplication,
  onOpenLabBooking,
  onCallAmbulance
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: '👋 Hello! I am LabMedix AI, your 24/7 Virtual Health & Diagnostic Assistant. How can I help your family today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '💳 Which Health Card is best for me?', action: () => handleSendPrompt('Which Health Card is best for me?') },
        { label: '🌡️ Tests needed for Fever & Headache?', action: () => handleSendPrompt('What tests are needed for fever and body ache?') },
        { label: '⚠️ Do I need fasting for Blood Tests?', action: () => handleSendPrompt('Which blood tests need 8-10 hours fasting?') },
        { label: '🚑 Book Emergency Ambulance', action: () => onCallAmbulance() }
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendPrompt = (userText: string) => {
    if (!userText.trim()) return;

    const newMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    // AI Semantic Clinical Answering Engine
    setTimeout(() => {
      let replyText = '';
      let actionBtns: Array<{ label: string; action: () => void }> | undefined = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('card') || lower.includes('tier') || lower.includes('membership') || lower.includes('cost')) {
        replyText = '💳 **LabMedix Smart Health Cards** provide flat 15% to 50% cashless discounts on all 350+ Lab Tests and free doctor visits:\n\n• **Silver (₹499/yr):** 15% OFF, covers 2 members.\n• **Gold (₹999/yr - Most Popular):** 25% OFF, covers 4 members + Free Home Sample Collection.\n• **Platinum (₹1,999/yr):** 35% OFF, covers 6 members + Free Full Body Checkup.\n• **VIP Diamond (₹4,999/yr):** 50% OFF, lifetime 10 members coverage.';
        actionBtns = [
          { label: '✨ Apply for Gold Card (₹999)', action: () => onOpenCardApplication('Gold') },
          { label: '👑 Apply for VIP Diamond', action: () => onOpenCardApplication('VIP') }
        ];
      } else if (lower.includes('fever') || lower.includes('jhor') || lower.includes('headache') || lower.includes('dengue')) {
        replyText = '🌡️ **Acute Fever & Viral Infection Protocol:**\nIf fever persists for more than 2 days with chills or retro-orbital pain, our clinical AI recommends:\n\n1. **Complete Blood Count (CBC) with Platelets** (STAT)\n2. **Dengue NS1 Antigen Serology** (Day 1-4)\n3. **Malaria Antigen (Pf/Pv)**\n4. **Widal Slide Test for Enteric Fever**\n\n*No fasting required. Hydrate with ORS fluids.*';
        actionBtns = [
          { label: '🧪 Book Fever Pathology Panel (45% OFF)', action: () => onOpenLabBooking() }
        ];
      } else if (lower.includes('fasting') || lower.includes('khali pet') || lower.includes('sugar') || lower.includes('lipid')) {
        replyText = '⚠️ **Phlebotomy Fasting Guidelines:**\n\n• **8-10 Hours Overnight Fasting Required:** Fasting Blood Sugar (FBS), Lipid Profile (Cholesterol/Triglycerides), Liver Function (LFT).\n• **Routine Non-Fasting (Anytime):** CBC, HbA1c, Thyroid (TSH), Kidney (Creatinine, Urea), Electrolytes, Dengue/Malaria.\n\n*Plain drinking water is permitted and encouraged before collection.*';
        actionBtns = [
          { label: '📅 Book Home Sample Collection', action: () => onOpenLabBooking() }
        ];
      } else if (lower.includes('ambulance') || lower.includes('emergency') || lower.includes('doctor')) {
        replyText = '🚨 **24/7 Rapid Emergency Hotline:**\nOur mobile ICU ambulances with oxygen support dispatch within 30 minutes across all districts. Call **10666** or **+880 1700-000000** for emergency priority pickup.';
        actionBtns = [
          { label: '📞 Call Ambulance Dispatch Now', action: () => onCallAmbulance() }
        ];
      } else {
        replyText = `🤖 I have analyzed your query "${userText}".\n\nLabMedix AI automates your health journey with **350+ Lab Tests**, **Dual-Chip CR80 Health Cards (15%-50% off)**, and **Instant Specialist Doctor Telemedicine**. Would you like to check diagnostic rates or apply for a health shield?`;
        actionBtns = [
          { label: '🔍 Explore 350+ Tests & Rates', action: () => onOpenLabBooking() },
          { label: '💳 Apply for Health Card', action: () => onOpenCardApplication('Gold') }
        ];
      }

      const aiReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: actionBtns
      };

      setMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Glowing Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-2xl shadow-teal-500/40 hover:scale-105 hover:shadow-teal-500/60 transition-all border-2 border-teal-300"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-pulse text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
          </div>
          <span className="tracking-wide">AI 24/7 Health Assistant</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-950/20 text-[9px] font-mono uppercase font-black">
            ONLINE
          </span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl bg-slate-950 border-2 border-teal-500/50 shadow-2xl shadow-teal-500/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border-b border-teal-500/30 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-tight">LabMedix Clinical AI</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-teal-300 font-mono">24/7 Smart Diagnostic Chatbot</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-none shadow-md font-medium'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md whitespace-pre-line font-normal'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Action Buttons attached to AI message */}
                {msg.actionButtons && msg.actionButtons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                    {msg.actionButtons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={btn.action}
                        className="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-slate-900 border border-teal-500/40 text-teal-300 hover:bg-teal-950 hover:border-teal-400 transition-all text-left flex items-center gap-1 shadow-sm"
                      >
                        <span>{btn.label}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-teal-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-500 font-mono px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] font-mono text-teal-300 pl-1">AI analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask symptoms, test rates, cards, fasting..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500 font-sans"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black p-2.5 rounded-xl shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
