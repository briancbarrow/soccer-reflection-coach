"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

type DisplayMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SimpleChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_EXCHANGES = 5;

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    // Add user message to chat
    const userMessage: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Format messages for Claude API
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add current message
      messageHistory.push({
        role: 'user',
        content: userMessage.content
      });

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messageHistory, exchangeCount: exchangeCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
        }
      ]);

      setExchangeCount(prev => prev + 1);

    } catch (error) {
      console.error('Error in chat:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Sorry, I couldn't process your message. Please try again.",
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <h2 className="text-xl font-semibold">Soccer Reflection Coach</h2>
        <p className="text-sm opacity-90">Share how your game went today</p>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-w-xl">
            <p className="text-gray-500 text-center">
              Start your reflection by sharing what you felt you did well today.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-300 bg-white p-4">
        <div className="flex items-center space-x-2">
          <textarea
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Type your reflection here..."
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ''}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatInterface;
