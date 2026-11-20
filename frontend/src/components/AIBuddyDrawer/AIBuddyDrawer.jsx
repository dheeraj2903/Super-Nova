import { useState } from 'react';
import { X, Send } from 'lucide-react';
import AiSparkleIcon from '../AiSparkleIcon';
import { mockProducts } from '../../data/mockProducts';
import styles from './AIBuddyDrawer.module.scss';

const QUICK_CHIPS = [
  'Best deals under ₹5,000',
  'Compare top headphones',
  'Trending in Electronics',
  'Track active order',
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: "Hello! I'm SUPERNOVA AI-Buddy. I can help you find curated deals, compare premium essentials, or check real-time availability. Here are today's featured spotlights:",
  products: [mockProducts[0], mockProducts[1]],
};

export default function AIBuddyDrawer({ isOpen, onClose, onAddToCart }) {
  const [input, setInput] = useState('');
  const [addedId, setAddedId] = useState(null);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const handleCartAction = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };

    let replyText = '';
    let recProducts = [];

    const lower = text.toLowerCase();
    if (lower.includes('5,000') || lower.includes('deal') || lower.includes('under')) {
      replyText = "Here are today's top curated essentials under ₹5,000, fully backed by our authenticity guarantee and free express shipping:";
      recProducts = [mockProducts[0], mockProducts[1]];
    } else if (lower.includes('headphone') || lower.includes('audio') || lower.includes('sound')) {
      replyText = "The **AuraWave ANC Studio** leads with 40-hr battery and adaptive hybrid noise cancellation. For compact daily listening, pair with our precision accessories:";
      recProducts = [mockProducts[1], mockProducts[4]];
    } else if (lower.includes('track') || lower.includes('order')) {
      replyText = "All active SUPERNOVA orders include live courier telemetry. Head over to **Account → My Orders & Live Tracking** for real-time dispatch updates and gate delivery times.";
    } else if (lower.includes('electronic') || lower.includes('tech') || lower.includes('trend')) {
      replyText = "Trending in Electronics right now: fast GaN charging architecture and spatial studio drivers. Here are our flagship picks:";
      recProducts = [mockProducts[4], mockProducts[1]];
    } else {
      replyText = `Searching SUPERNOVA's catalog for "${text}"… Here are top matching curated essentials you might love:`;
      const matched = mockProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower)
      );
      recProducts = matched.length > 0 ? matched.slice(0, 2) : [mockProducts[0], mockProducts[2]];
    }

    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', text: replyText, products: recProducts },
    ]);
    setInput('');
  };

  const handleChip = (chip) => sendMessage(chip);
  const handleSend = () => sendMessage(input);
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
              <AiSparkleIcon size={20} fill="#FFFFFF" />
            </div>
            <div className={styles.titleWrap}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>AI-Buddy</h2>
                <span className={styles.tagPill}>Curated Shopping AI</span>
              </div>
              <p className={styles.subtitle}>Instant tailored recommendations &amp; support</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close AI-Buddy">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Messages Stream */}
        <div className={styles.body}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.msgRow} ${msg.role === 'user' ? styles.user : styles.assistant}`}
            >
              <div className={styles.bubble}>
                <p
                  className={styles.msgText}
                  dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {/* Embedded Product Recommendation Mini-Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className={styles.productRecs}>
                    {msg.products.map((p) => (
                      <div key={p._id} className={styles.recCard}>
                        <img src={p.image} alt={p.title} className={styles.recImg} />
                        <div className={styles.recInfo}>
                          <span className={styles.recTitle}>{p.title}</span>
                          <div className={styles.recPriceRow}>
                            <span className={styles.recPrice}>
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                            {p.discount && (
                              <span className={styles.recDiscount}>{p.discount}% OFF</span>
                            )}
                          </div>
                        </div>
                        <div className={styles.recActions}>
                          <a
                            href={`/products?category=${p.category.toLowerCase()}`}
                            className={styles.recViewBtn}
                          >
                            View
                          </a>
                          <button
                            type="button"
                            className={styles.recCartBtn}
                            onClick={() => handleCartAction(p)}
                          >
                            {addedId === p._id ? 'Added ✓' : '+ Cart'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompt suggestion chips (clean 2-column grid) */}
        <div className={styles.chips}>
          {QUICK_CHIPS.map((chip) => (
            <button key={chip} className={styles.chip} onClick={() => handleChip(chip)}>
              {chip}
            </button>
          ))}
        </div>

        {/* Command Input Bar */}
        <div className={styles.inputWrap}>
          <div className={styles.commandBox}>
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
        </div>
      </aside>
    </>
  );
}
