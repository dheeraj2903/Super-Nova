import { useState } from 'react';
import { X, Sparkles, Send, MessageSquare } from 'lucide-react';
import styles from './AIBuddyDrawer.module.scss';

const QUICK_CHIPS = [
  'Best deals under ₹5,000',
  'Compare top headphones',
  'Track my active order',
  'Trending in Electronics',
  'Sustainable picks',
];

const SAMPLE_RESPONSES = {
  'Best deals under ₹5,000': 'Here are today\'s top picks under ₹5,000: **StrideLite Knit Sneakers** (₹2,499), **Meridian TWS Earbuds** (₹2,899), **Apex Ceramic Pour-Over** (₹2,199), and **Zenith GaN Charger** (₹1,799). All carry our authenticity guarantee and free express shipping!',
  'Compare top headphones': 'The **AuraWave ANC Studio** (₹3,499) leads with 40-hr battery & hybrid ANC. The **Meridian TWS** (₹2,899) offers true wireless freedom. For studio reference, the AuraWave wins on soundstage. For daily commute, Meridian\'s compact case is unbeatable.',
  'Track my active order': 'Please log in to view live order tracking. Once logged in, go to **Account → My Orders & Live Tracking** to see real-time dispatch updates and estimated delivery windows.',
};

export default function AIBuddyDrawer({ isOpen, onClose, prefillQuery }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I\'m SUPERNOVA AI-Buddy. I can help you find the best deals, compare products, or answer any shopping questions. What\'re you looking for today?',
    },
  ]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    const reply = SAMPLE_RESPONSES[text] || `Great question! Searching SUPERNOVA's catalog for "${text}"… I'll surface the best matches and pricing insights shortly. Meanwhile, check the **Trending & Hot Deals** section below for curated picks.`;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', text: reply },
    ]);
    setInput('');
  };

  const handleChip = (chip) => sendMessage(chip);
  const handleSend = () => sendMessage(input);
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="AI-Buddy shopping assistant"
      >
        {/* Head */}
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <div className={styles.avatarWrap}>
              <span className={styles.avatarIcon}>✦</span>
              <span className={styles.statusDot} />
            </div>
            <div>
              <h2 className={styles.title}>AI-Buddy</h2>
              <p className={styles.status}>Online · Instant responses</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close AI-Buddy">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div className={styles.body}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.user : styles.assistant}`}>
              {msg.role === 'assistant' && (
                <span className={styles.msgAvatar}>✦</span>
              )}
              <div className={styles.bubble}>
                <p
                  className={styles.msgText}
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className={styles.chips}>
          {QUICK_CHIPS.map((chip) => (
            <button key={chip} className={styles.chip} onClick={() => handleChip(chip)}>
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className={styles.inputWrap}>
          <textarea
            className={styles.input}
            placeholder="Ask about products, deals, comparisons…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send size={15} strokeWidth={2} />
          </button>
        </div>
      </aside>
    </>
  );
}
