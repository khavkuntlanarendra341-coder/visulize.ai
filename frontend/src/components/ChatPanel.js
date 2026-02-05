import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Lightbulb, Sparkles } from 'lucide-react';

const ChatPanel = ({ messages, onSendMessage, isLoading, whatIfMode }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const suggestedQuestions = whatIfMode ? [
    "What if this component fails?",
    "What happens if I remove this part?",
    "How would this work differently if...",
  ] : [
    "How does this work?",
    "What is the purpose of this?",
    "How can I maintain this?",
  ];

  const formatMessage = (content) => {
    // Basic markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-semibold text-primary-300 mt-3 mb-1">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-bold text-primary-200 mt-4 mb-2">{line.slice(3)}</h3>;
        }
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        // Numbered lists
        if (/^\d+\.\s/.test(line)) {
          return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
        }
        // Bold text
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Empty lines
        if (!line.trim()) {
          return <br key={i} />;
        }
        return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: boldFormatted }} />;
      });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-400" />
          <span className="font-medium text-white">AI Assistant</span>
          {whatIfMode && (
            <span className="px-2 py-0.5 bg-accent-600/30 text-accent-300 text-xs rounded-full flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              What-If Mode
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Ready to Explore!
            </h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Click on any part of the image or ask a question to start learning.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message-enter flex gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                ${message.type === 'user' 
                  ? 'bg-primary-600' 
                  : message.type === 'error' 
                    ? 'bg-red-600' 
                    : message.isWhatIf 
                      ? 'bg-accent-600' 
                      : 'bg-gray-700'
                }
              `}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : message.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : message.isWhatIf ? (
                  <Lightbulb className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`
                max-w-[80%] rounded-2xl px-4 py-3
                ${message.type === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : message.type === 'error' 
                    ? 'bg-red-900/50 text-red-200 border border-red-700' 
                    : message.isWhatIf
                      ? 'bg-accent-900/30 text-gray-200 border border-accent-700/50 rounded-bl-sm'
                      : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                }
              `}>
                {message.isTap ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {formatMessage(message.content)}
                  </div>
                )}
                <div className={`
                  text-xs mt-2 
                  ${message.type === 'user' ? 'text-primary-200' : 'text-gray-500'}
                `}>
                  {message.timestamp?.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="loading-dots flex gap-1">
                <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length > 0 && messages.length < 3 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => !isLoading && onSendMessage(q)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={whatIfMode ? "Ask a 'what if' question..." : "Ask about the image..."}
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
