import { useState, useRef, useEffect } from 'react';

const ChatBot = ({ webhookUrl = import.meta.env.VITE_KARSADA_WEBHOOK_URL, chatBotName = "PrimaCare", userName = "User" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, sender, isHtml = false) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender,
      isHtml,
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async () => {
    const message = inputMessage.trim();
    if (!message || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    addMessage(message, 'user');

    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('user', userName);

    const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        message: message,
        user: userName,
    }),
    });

      if (response.ok) {
        const text = await response.text();
        let botReply = text;
        
        try {
          const data = JSON.parse(text);
          botReply = data.output || text;
        } catch (e) {
          botReply = text || 'Pesan diterima';
        }
        
        addMessage(botReply, 'bot', true);
      } else {
        addMessage('Maaf, terjadi kesalahan pada layanan.', 'bot');
      }
    } catch (error) {
      addMessage('Gagal terhubung ke layanan chat.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="font-sans">
      {/* Toogle Button */}
      <button
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full border-0 text-white text-3xl cursor-pointer shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'bg-red-500 hover:rotate-90' : 'bg-[#1b3c53] hover:scale-110'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot */}
      <div className={`fixed bottom-28 right-6 w-[21.22%] md:w-[400px] h-[49.38%] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col transition-all duration-300 z-40 overflow-hidden ${
        isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'
      }`}>
        
        {/* Header */}
        <div className="bg-[#1b3c53] text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-bold tracking-wide">{chatBotName}</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 text-2xl">×</button>
        </div>

        {/* Messages Area */}
        <div ref={messagesRef} className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 my-auto">
              <p className="text-4xl mb-2">🤖</p>
              <p className="text-sm px-8 italic">Halo! Ada yang bisa {chatBotName} bantu hari ini?</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-2 rounded-full text-xs text-gray-500 animate-bounce">
                Sedang mengetik....
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2 bg-gray-100 rounded-full px-4 py-2 items-center focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Tulis pesan..."
              rows="1"
              className="flex-1 bg-transparent border-none outline-none text-sm resize-none py-1"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="text-indigo-600 disabled:text-gray-400 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;