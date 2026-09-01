import React, { useState, useRef, useEffect } from 'react';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiCpu,
  FiTrendingUp,
  FiAlertTriangle,
  FiCalendar,
  FiFileText,
  FiClock,
  FiZap,
  FiCornerDownLeft,
  FiShield,
  FiTarget,
  FiActivity
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { sendAiChatMessageApi } from '../../services/api';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm **AttendPro AI**. Ask me anything about your attendance percentage, forecasting future skip scenarios, or recovery requirements!",
      cardData: {
        type: 'general_help',
        suggestions: [
          'Can I skip 2 classes?',
          'How many classes can I miss?',
          'How many classes must I attend?',
          'Forecast my attendance',
          'My attendance?',
          'Can I skip tomorrow?'
        ]
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const promptPills = [
    { label: 'Can I skip 2 classes?', icon: FiZap, query: 'Can I skip 2 classes?' },
    { label: 'How many can I miss?', icon: FiShield, query: 'How many classes can I miss?' },
    { label: 'How many must I attend?', icon: FiTarget, query: 'How many classes must I attend?' },
    { label: 'Forecast attendance', icon: FiActivity, query: 'Forecast my attendance' },
    { label: 'My attendance?', icon: FiTrendingUp, query: 'My attendance?' },
    { label: 'Can I skip tomorrow?', icon: FiCalendar, query: 'Can I skip tomorrow?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customQuery) => {
    const textToSend = customQuery || input.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setLoading(true);

    try {
      const response = await sendAiChatMessageApi(textToSend);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply || 'Here is what I found for your query.',
        intent: response.intent,
        cardData: response.cardData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `❌ Error querying AI Assistant: ${err.message || 'Failed to process request.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderCardContent = (cardData) => {
    if (!cardData) return null;

    if (cardData.type === 'attendance_overview') {
      return (
        <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Total Attendance:</span>
            <span className="font-bold text-white text-sm">{cardData.overallPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${cardData.overallPercent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(cardData.overallPercent, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] text-center text-slate-300">
            <div className="p-1 bg-slate-900 rounded">
              <span className="block text-slate-400 text-[9px]">CONDUCTED</span>
              <span className="font-semibold text-white">{cardData.totalConducted}</span>
            </div>
            <div className="p-1 bg-slate-900 rounded">
              <span className="block text-slate-400 text-[9px]">PRESENT</span>
              <span className="font-semibold text-emerald-400">{cardData.totalPresent}</span>
            </div>
            <div className="p-1 bg-slate-900 rounded">
              <span className="block text-slate-400 text-[9px]">ABSENT</span>
              <span className="font-semibold text-rose-400">{cardData.totalAbsent}</span>
            </div>
          </div>
        </div>
      );
    }

    if (cardData.type === 'can_skip_card') {
      return (
        <div className={`mt-3 p-3 rounded-xl border text-xs space-y-2 ${cardData.canSkip ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'}`}>
          <div className="flex justify-between items-center font-bold">
            <span className="text-white">{cardData.subject}</span>
            <span className={cardData.canSkip ? 'text-emerald-400' : 'text-rose-400'}>
              {cardData.canSkip ? 'SAFE TO SKIP' : 'RISKY / NOT ADVISED'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
            <div className="p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-slate-400 block text-[9px]">CURRENT</span>
              <span className="font-bold text-white">{cardData.currentPercent}%</span>
            </div>
            <div className="p-1.5 bg-slate-900/80 rounded-lg">
              <span className="text-slate-400 block text-[9px]">PROJECTED</span>
              <span className={`font-bold ${cardData.canSkip ? 'text-emerald-400' : 'text-rose-400'}`}>{cardData.projectedPercent}%</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-300">
            {cardData.canSkip ? (
              <span>🛡️ Safe buffer remaining: <strong className="text-emerald-400">{cardData.bufferAfter} classes</strong></span>
            ) : (
              <span>🎯 Consecutive penalty: <strong className="text-rose-400">{cardData.penaltyAfter} classes</strong></span>
            )}
          </div>
        </div>
      );
    }

    if (cardData.type === 'miss_allowance_card') {
      return (
        <div className="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Safe Miss Buffer</span>
            <span className="font-extrabold text-emerald-400">{cardData.safeMisses !== undefined ? `${cardData.safeMisses} classes` : `${cardData.overallSafe} classes overall`}</span>
          </div>
          <p className="text-[11px] text-slate-300">
            You can miss these classes consecutively without dropping below 75%.
          </p>
        </div>
      );
    }

    if (cardData.type === 'must_attend_card') {
      return (
        <div className="mt-3 p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Recovery Requirement</span>
            <span className="font-extrabold text-amber-400">{cardData.consecutiveNeeded !== undefined ? `${cardData.consecutiveNeeded} consecutive` : `${cardData.overallNeeded} consecutive`}</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Mandatory attended lectures without missing to restore attendance to 75%.
          </p>
        </div>
      );
    }

    if (cardData.type === 'forecast_summary_card') {
      return (
        <div className="mt-3 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Overall Forecast</span>
            <span className="font-extrabold text-indigo-300">{cardData.forecast?.summary.overallPercentage}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
            <div className="p-1 bg-slate-900 rounded">
              <span className="text-slate-400 block">SAFE BUFFER</span>
              <span className="font-bold text-emerald-400">{cardData.forecast?.summary.overallSafeMisses} classes</span>
            </div>
            <div className="p-1 bg-slate-900 rounded">
              <span className="text-slate-400 block">RECOVERY</span>
              <span className="font-bold text-amber-400">{cardData.forecast?.summary.overallConsecutiveNeeded} classes</span>
            </div>
          </div>
        </div>
      );
    }

    if (cardData.type === 'skip_tomorrow_analysis' && cardData.classes) {
      return (
        <div className="mt-3 space-y-2">
          {cardData.classes.map((cls, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border text-xs ${cls.isHighRisk ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/60 border-slate-800'}`}>
              <div className="flex justify-between font-semibold text-white">
                <span>{cls.subject}</span>
                <span className={cls.isHighRisk ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {cls.isHighRisk ? 'HIGH RISK' : 'SAFE'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Slot: {cls.timeSlot}</span>
                <span>If Skipped: <strong className={cls.isHighRisk ? 'text-rose-400' : 'text-slate-200'}>{cls.projectedIfSkipped}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (cardData.type === 'report_link' || cardData.actionUrl) {
      return (
        <div className="mt-3 pt-2">
          <button
            onClick={() => {
              setIsOpen(false);
              navigate(cardData.actionUrl || '/student/report');
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>{cardData.actionLabel || 'Go to Report Page'}</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-indigo-400/30"
          title="AttendPro AI Chatbot"
        >
          <div className="relative">
            <FiCpu className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <span className="hidden group-hover:inline-block text-xs font-semibold tracking-wide pr-1">
            AI Chatbot
          </span>
        </button>
      </div>

      {/* Slide-out / Floating Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[580px] h-[520px] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl shadow-md text-white">
                <FiZap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  AttendPro <span className="gradient-text">AI Assistant</span>
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  NLP Attendance Prediction Engine
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Pills Bar */}
          <div className="px-3 py-2 border-b border-slate-800/60 bg-slate-950/40 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            {promptPills.map((pill, idx) => {
              const Icon = pill.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(pill.query)}
                  disabled={loading}
                  className="whitespace-nowrap px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-600/80 hover:text-white text-[11px] font-medium text-slate-300 rounded-lg transition-all border border-slate-700/50 flex items-center gap-1 flex-shrink-0"
                >
                  <Icon className="w-3 h-3 text-indigo-400" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Text message split by newlines */}
                  <div className="space-y-1">
                    {msg.text.split('\n').map((line, lIdx) => {
                      if (!line.trim()) return <div key={lIdx} className="h-1" />;
                      return (
                        <p key={lIdx}>
                          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </p>
                      );
                    })}
                  </div>

                  {/* Render Card Content if available */}
                  {msg.cardData && renderCardContent(msg.cardData)}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 text-xs text-slate-400">
                <div className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                  <FiCpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>AI is calculating attendance vectors...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask 'My attendance?' or 'Can I skip tomorrow?'..."
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 text-white rounded-xl disabled:opacity-40 transition-all shadow-md"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
