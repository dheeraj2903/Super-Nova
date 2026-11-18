import { useState, useEffect, useRef } from 'react';
import '../CartDrawer/CartDrawer.css'; /* shared overlay + drawer shell */
import './AIBuddyDrawer.css';

function SparkIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#7E6140" aria-hidden="true">
      <path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </svg>
  );
}

const INITIAL_MSG = {
  role: 'ai',
  text: "Hi! Tell me what you're looking for and your budget — I'll find the best options and can add them to your cart.",
};

export default function AIBuddyDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || thinking) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setThinking(true);

    /* Simulated AI response — wire to your AI-Buddy microservice */
    await new Promise((r) => setTimeout(r, 1200));
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text: `Got it! Searching for "${text}"… I'll surface the best matches from our catalogue shortly. (Connect the AI-Buddy microservice at /api/ai-buddy/chat to make this live.)`,
      },
    ]);
    setThinking(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-overlay${isOpen ? ' drawer-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`drawer${isOpen ? ' drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="AI-Buddy assistant"
      >
        {/* Header */}
        <div className="drawer__header">
          <div className="ai-buddy-header-icon">
            <SparkIcon />
            AI-Buddy
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Close AI-Buddy">✕</button>
        </div>

        {/* Chat body */}
        <div className="drawer__body">
          <div className="ai-buddy-chat">
            {messages.map((msg, i) =>
              msg.role === 'ai' ? (
                <div key={i} className="ai-bubble">{msg.text}</div>
              ) : (
                <div key={i} className="user-bubble">{msg.text}</div>
              )
            )}
            {thinking && (
              <div className="ai-bubble">
                <span>AI-Buddy is thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input footer */}
        <div className="drawer__footer">
          <div className="ai-buddy-input-row">
            <textarea
              className="ai-buddy-textarea"
              placeholder="Describe what you need and your budget…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              aria-label="Message AI-Buddy"
            />
            <button
              className="ai-buddy-send"
              onClick={handleSend}
              disabled={!input.trim() || thinking}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
          <p className="ai-buddy-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </aside>
    </>
  );
}
