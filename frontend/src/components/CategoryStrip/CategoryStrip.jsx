import './CategoryStrip.css';

const CATEGORIES = [
  { name: 'Electronics', sym: '#s-watch', count: 214 },
  { name: 'Audio',       sym: '#s-head',  count: 128 },
  { name: 'Footwear',    sym: '#s-shoe',  count: 176 },
  { name: 'Bags',        sym: '#s-bag',   count: 92  },
  { name: 'Home Decor',  sym: '#s-vase',  count: 143 },
  { name: 'Accessories', sym: '#s-wallet',count: 205 },
];

export default function CategoryStrip({ activeCategory, onSelect }) {
  return (
    <section className="category-strip">
      <div className="category-strip__header">
        <h2 className="category-strip__title">Shop by Category</h2>
      </div>

      <div className="category-strip__grid">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            className={`category-tile${activeCategory === cat.name ? ' category-tile--active' : ''}`}
            onClick={() => onSelect(cat.name)}
            aria-pressed={activeCategory === cat.name}
          >
            <svg width="84" height="84" viewBox="0 0 120 120" aria-hidden="true">
              <use href={cat.sym} />
            </svg>
            <span className="category-tile__name">{cat.name}</span>
            <span className="category-tile__count">{cat.count} items</span>
          </button>
        ))}
      </div>
    </section>
  );
}
