import { ArrowRight, Check, ImagePlus, MessageCircle, ShoppingBag, Sparkles, Store, Zap } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";

const steps = [
  { number: "01", title: "Add your products", copy: "Name, price, stock, and photos in one clean dashboard." },
  { number: "02", title: "Share one link", copy: "Put your storefront in your bio, Status, or customer chats." },
  { number: "03", title: "Close the sale", copy: "Customers build a cart and hand you a complete WhatsApp order." },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-950">
      <header className="site-header">
        <Link href="/" className="brand-lockup" aria-label="QuickStore home">
          <span className="brand-mark"><ShoppingBag size={18} strokeWidth={2.5} /></span>
          <span>QuickStore</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
          <a href="#how-it-works" className="hover:text-slate-950">How it works</a>
          <a href="#advantage" className="hover:text-slate-950">Why merchants use it</a>
          <Link href="/dashboard" className="button button-ghost">Merchant dashboard</Link>
        </nav>
        <Link href="/dashboard" className="button button-dark md:hidden">Start selling</Link>
      </header>

      <main>
        <section className="hero-shell">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Built for Nigerian & global WhatsApp merchants</div>
            <h1>Turn your WhatsApp into a <span className="text-blue">high-converting storefront.</span></h1>
            <p className="hero-lede">Create a mobile-optimized store in minutes. Showcase products in naira, let customers build a cart, and receive pristine, structured order payloads straight on WhatsApp.</p>
            <div className="hero-actions">
              <button onClick={startLogin} className="button button-blue button-lg">Create your account <ArrowRight size={17} /></button>
              <Link href="/dashboard" className="button button-white button-lg">Open my dashboard</Link>
            </div>
            <div className="trust-row"><Check size={15} /> No upfront payment gateway fees <Check size={15} /> Instant WhatsApp order redirect</div>
          </div>
          <div className="hero-visual" aria-label="WhatsApp order preview">
            <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
            <div className="phone-card">
              <div className="phone-top"><span className="phone-camera" /><span className="phone-speaker" /></div>
              <div className="phone-screen">
                <div className="phone-nav"><span className="mini-logo"><ShoppingBag size={12} /></span><span>your storefront</span><span className="live-dot" /></div>
                <div className="phone-hero"><span>Your store</span><strong>Ready when<br />you are.</strong><small>Share your link →</small></div>
                <div className="phone-section-label"><span>Your products</span><span>Add products</span></div>
                <div className="phone-products">
                  <div className="phone-product product-dress"><span className="product-tag">PHOTO</span><strong>Product one</strong><small>Add price</small></div>
                  <div className="phone-product product-glow"><strong>Product two</strong><small>Add price</small></div>
                </div>
                <div className="phone-cart"><span><ShoppingBag size={14} /> 0 items</span><strong>₦0</strong><ArrowRight size={14} /></div>
              </div>
            </div>
            <div className="float-card float-order"><span className="float-icon whatsapp-icon"><MessageCircle size={16} /></span><span><b>Ready for your first order</b><small>Set up your WhatsApp number</small></span><span className="float-check">✓</span></div>
            <div className="float-card float-sales"><span className="float-icon sales-icon"><Zap size={16} /></span><span><b>Start selling</b><small>Build your catalog</small></span><span className="sales-up">→</span></div>
          </div>
        </section>

        <section id="advantage" className="advantage-section">
          <div className="section-kicker">THE MERCHANT ADVANTAGE</div>
          <div className="section-heading-row"><h2>Stop losing orders<br />in the DM chaos.</h2><p>Traditional customers ask “How much?” and send messy screenshots. QuickStore gives them an interactive cart, enforces complete delivery details, and formats the order before opening WhatsApp.</p></div>
          <div className="advantage-grid">
            <div className="advantage-card advantage-featured"><div className="feature-icon"><Store size={21} /></div><h3>A storefront that feels like your brand</h3><p>Share a polished product catalog instead of forwarding price lists one customer at a time.</p><div className="feature-line" /></div>
            <div className="advantage-card"><div className="feature-icon soft"><ImagePlus size={21} /></div><h3>Photos that sell</h3><p>Upload a product image, see it instantly, and keep it attached to the product after refresh.</p></div>
            <div className="advantage-card"><div className="feature-icon green"><MessageCircle size={21} /></div><h3>Orders ready to send</h3><p>Customers confirm their name, phone, address, and delivery preference before WhatsApp opens.</p></div>
          </div>
        </section>

        <section id="how-it-works" className="steps-section">
          <div className="section-kicker">THREE STEPS TO LIVE</div>
          <h2>From product idea<br />to order notification.</h2>
          <div className="steps-grid">{steps.map(step => <div key={step.number} className="step-card"><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></div>)}</div>
        </section>

        <section className="cta-section"><div><Sparkles size={20} /><h2>Your next sale is<br />one link away.</h2></div><button onClick={startLogin} className="button button-dark button-lg">Create your account <ArrowRight size={17} /></button></section>
      </main>
      <footer className="site-footer"><span>© 2026 QuickStore</span><span>Mobile-first commerce for ambitious merchants.</span><span>Made for WhatsApp selling.</span></footer>
    </div>
  );
}
