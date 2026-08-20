import React, { useState, useRef, useEffect } from 'react';
import {
  FiSend,
  FiCpu,
  FiZap,
  FiTrendingUp,
  FiAlertTriangle,
  FiCalendar,
  FiFileText,
  FiClock,
  FiTrash2,
  FiInfo,
  FiCornerDownLeft
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { sendAiChatMessageApi } from '../../services/api';

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Welcome to **AttendPro AI Workspace**! I am your real-time attendance intelligence bot. Ask me questions about your percentage, skip safety for tomorrow, or low attendance alerts.",
      cardData: {
        type: 'general_help',
        suggestions: [
          'My attendance?',
          'Subjects below 75%',
          'Can I skip tomorrow?',
          'Attendance report',
          'Remaining lectures'
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
    { label: 'My attendance?', icon: FiTrendingUp, query: 'My attendance?' },
    { label: 'Subjects below 75%', icon: FiAlertTriangle, query: 'Subjects below 75%' },
    { label: 'Can I skip tomorrow?', icon: FiCalendar, query: 'Can I skip tomorrow?' },
    { label: 'Attendance report', icon: FiFileText, query: 'Attendance report' },
    { label: 'Remaining lectures', icon: FiClock, query: 'Remaining lectures' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        text: response.reply || 'Here is the detailed breakdown for your query.',
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
          text: `❌ Error processing query: ${err.message || 'Server response failed.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Conversation cleared. How can I assist you with your attendance today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderCardContent = (cardData) => {
    if (!cardData) return null;

    if (cardData.type === 'attendance_overview') {
      return (
        <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Overall Attendance Percentage</span>
            <span className={`text-base font-extrabold ${cardData.overallPercent >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cardData.overallPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${cardData.overallPercent >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`}
              style={{ width: `${Math.min(cardData.overallPercent, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-center">
            <div className="p-2 bg-slate-900 rounded-xl">
              <span className="block text-slate-400 text-[10px]">CONDUCTED</span>
              <span className="font-bold text-white">{cardData.totalConducted}</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl">
              <span className="block text-slate-400 text-[10px]">PRESENT</span>
              <span className="font-bold text-emerald-400">{cardData.totalPresent}</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl">
              <span className="block text-slate-400 text-[10px]">ABSENT</span>
              <span className="font-bold text-rose-400">{cardData.totalAbsent}</span>
            </div>
          </div>
        </div>
      );
    }

    if (cardData.type === 'skip_tomorrow_analysis' && cardData.classes) {
      return (
        <div className="mt-3 space-y-2">
          {cardData.classes.map((cls, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border text-xs ${cls.isHighRisk ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/80 border-slate-800'}`}>
              <div className="flex justify-between font-semibold text-white">
                <span>{cls.subject}</span>
                <span className={cls.isHighRisk ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {cls.isHighRisk ? 'HIGH RISK (DROPS BELOW 75%)' : 'SAFE TO SKIP'}
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
        <div className="mt-3">
          <button
            onClick={() => navigate(cardData.actionUrl || '/student/report')}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <FiFileText className="w-4 h-4" />
            <span>{cardData.actionLabel || 'Go to Official Report Page'}</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl text-white shadow-lg">
            <FiZap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              AttendPro <span className="gradient-text">AI Assistant Console</span>
            </h1>
            <p className="text-xs text-slate-400">
              Natural Language Attendance Intelligence & Predictor
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/50"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Preset Prompt Pills Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {promptPills.map((pill, idx) => {
          const Icon = pill.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(pill.query)}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-900/80 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-2xl text-xs font-medium border border-slate-800 hover:border-indigo-500 transition-all flex items-center gap-2 flex-shrink-0 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Feed Area */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 overflow-y-auto space-y-4 backdrop-blur-xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-3xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-lg'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-md'
              }`}
            >
              <div className="space-y-1.5">
                {msg.text.split('\n').map((line, lIdx) => {
                  if (!line.trim()) return <div key={lIdx} className="h-1" />;
                  return (
                    <p key={lIdx}>
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>

              {msg.cardData && renderCardContent(msg.cardData)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-2">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-3xl rounded-bl-none flex items-center gap-2">
              <FiCpu className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>AttendPro AI is processing your attendance records...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your attendance query (e.g., 'My attendance?', 'Can I skip tomorrow?')..."
            disabled={loading}
            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-2 shadow-lg"
          >
            <span>Send</span>
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
