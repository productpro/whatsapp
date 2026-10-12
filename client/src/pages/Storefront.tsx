import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type CartLine = { id: number; quantity: number };
const money = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export default function Storefront() {
  const [, params] = useRoute("/store/:slug");
  const slug = params?.slug || "bella-ankara-glamour";
  const catalog = trpc.catalog.get.useQuery({ slug });
  const [cart, setCart] = useState<CartLine[]>(() => { try { return JSON.parse(localStorage.getItem(`quickstore-cart-${slug}`) || "[]"); } catch { return []; } });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", fulfillment: "Delivery", address: "", note: "" });
  const store = catalog.data?.store;
  const products = catalog.data?.products ?? [];
  const categories = ["All", ...Array.from(new Set(products.map(product => product.category)))];
  const filtered = products.filter(product => product.isPublished && (category === "All" || product.category === category) && `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase()));
  const cartItems = cart.map(line => { const product = products.find(item => item.id === line.id); return product ? { ...product, quantity: line.quantity } : null; }).filter(Boolean) as Array<(typeof products)[number] & { quantity: number }>;
  const total = cartItems.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => { localStorage.setItem(`quickstore-cart-${slug}`, JSON.stringify(cart)); }, [cart, slug]);

  const addToCart = (id: number) => { setCart(current => { const exists = current.find(item => item.id === id); return exists ? current.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { id, quantity: 1 }]; }); toast.success("Added to cart"); };
  const changeQuantity = (id: number, delta: number) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  const clearCart = () => setCart([]);

  const sendOrder = () => {
    if (!cartItems.length) return toast.error("Add at least one product first.");
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) return toast.error("Add your name, phone, and delivery details.");
    const normalizedPhone = customer.phone.replace(/\D/g, "").replace(/^0/, "234");
    const lines = cartItems.map((item, index) => `${index + 1}. *${item.name}* (x${item.quantity}) ↳ ${money(item.price * item.quantity)}`).join("\n");
    const message = `🛍️ *NEW ORDER - ${store?.name?.toUpperCase() || "QUICKSTORE"}*\n\n👤 *Customer Details:*\n\n• Name: ${customer.name}\n• Phone: ${customer.phone}\n• ${customer.fulfillment}: ${customer.address}\n${customer.note ? `• Note: ${customer.note}\n` : ""}\n🛒 *Items Ordered (${itemCount} items):*\n\n${lines}\n\n💰 *TOTAL AMOUNT: ${money(total)}*\n\nPlease confirm order availability and send bank transfer account details!`;
    const merchantNumber = (store?.whatsappNumber || "08034567890").replace(/\D/g, "").replace(/^0/, "234");
    window.open(`https://wa.me/${merchantNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp is ready with your order.");
  };

  if (catalog.isLoading) return <div className="store-loading"><ShoppingBag size={28} /><span>Opening storefront…</span></div>;
  if (catalog.error) return <div className="store-loading"><span>Could not load this storefront.</span><button className="button button-blue" onClick={() => catalog.refetch()}>Try again</button></div>;
  if (!store) return <div className="store-loading"><ShoppingBag size={28} /><h2>This storefront is not live yet.</h2><p>The merchant link may be new or unavailable.</p><Link href="/" className="button button-blue">Create your own store <ArrowRight size={16} /></Link></div>;

  return <div className="storefront-shell" style={{ "--store-accent": store?.accentColor || "#1d4ed8" } as React.CSSProperties}>
    <div className="storetopbar"><Link href="/" className="store-back"><ArrowLeft size={16} /> QuickStore</Link><Link href="/dashboard" className="store-manage">Build your own store <ArrowRight size={14} /></Link></div>
    <header className="store-header"><div className="store-avatar">BA</div><div className="store-identity"><h1>{store?.name}</h1><p>{store?.tagline}</p><span>{store?.location} <i>·</i> Open today</span></div><button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Open cart"><ShoppingBag size={19} /><span>{itemCount}</span></button></header>
    <section className="store-banner"><div><span className="banner-pill">THE NEW DROP</span><h2>Pieces that<br /><em>move with you.</em></h2><p>Fresh textures, joyful colour, and everyday favourites made in Lagos.</p></div><div className="banner-pattern"><span>BA</span></div></section>
    <main className="store-content"><div className="store-tools"><div className="search-box"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products" /></div><button className="category-select">{category}<ChevronDown size={15} /></button></div><div className="category-pills">{categories.map(item => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="store-grid">{filtered.map(product => <article className="store-product-card" key={product.id}><div className="store-product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="image-placeholder"><ShoppingBag size={28} /></div>}<span className="product-category">{product.category}</span><button className="add-floating" onClick={() => addToCart(product.id)} aria-label={`Add ${product.name} to cart`}><Plus size={18} /></button></div><div className="store-product-copy"><h3>{product.name}</h3><p>{product.description}</p><strong>{money(product.price)}</strong></div></article>)}</div>{!filtered.length && <div className="empty-store"><Search size={24} /><h3>No products found</h3><p>Try another search or category.</p></div>}</main>
    <footer className="store-footer"><span>Powered by <strong>QuickStore</strong></span><span>Sell beautifully on WhatsApp.</span></footer>

    {cartOpen && <div className="drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer"><div className="drawer-heading"><div><span className="dashboard-kicker">YOUR BAG</span><h2>{itemCount} {itemCount === 1 ? "item" : "items"}</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={19} /></button></div>{cartItems.length ? <><div className="cart-lines">{cartItems.map(item => <div className="cart-line" key={item.id}><div className="cart-line-image">{item.imageUrl && <img src={item.imageUrl} alt="" />}</div><div className="cart-line-info"><strong>{item.name}</strong><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)}><Plus size={13} /></button></div></div><button className="row-delete" onClick={() => setCart(current => current.filter(line => line.id !== item.id))}><Trash2 size={15} /></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{money(total)}</strong></div><small>Delivery fee is confirmed by the merchant on WhatsApp.</small><button className="button button-blue button-wide" onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}>Continue to checkout <ArrowRight size={16} /></button><button className="clear-button" onClick={clearCart}>Clear cart</button></div></> : <div className="empty-cart"><ShoppingBag size={26} /><h3>Your bag is empty</h3><p>Add something beautiful from the collection.</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Keep browsing</button></div>}</aside></div>}
    {checkoutOpen && <div className="drawer-backdrop"><aside className="cart-drawer checkout-drawer"><div className="drawer-heading"><div><button className="back-button" onClick={() => { setCheckoutOpen(false); setCartOpen(true); }}><ArrowLeft size={14} /> Back to bag</button><h2>Checkout details</h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X size={19} /></button></div><div className="checkout-total"><span>Order total</span><strong>{money(total)}</strong><small>{itemCount} items · delivery arranged on WhatsApp</small></div><div className="checkout-form"><label><span>Full name</span><input value={customer.name} onChange={event => setCustomer({ ...customer, name: event.target.value })} placeholder="Amina Ibrahim" /></label><label><span>Phone number</span><input value={customer.phone} onChange={event => setCustomer({ ...customer, phone: event.target.value })} placeholder="0803 456 7890" inputMode="tel" /></label><label><span>Fulfilment</span><select value={customer.fulfillment} onChange={event => setCustomer({ ...customer, fulfillment: event.target.value })}><option>Delivery</option><option>Pickup</option></select></label><label><span>{customer.fulfillment} details</span><input value={customer.address} onChange={event => setCustomer({ ...customer, address: event.target.value })} placeholder={customer.fulfillment === "Delivery" ? "Plot 14 Admiralty Way, Lekki" : "Preferred pickup time"} /></label><label><span>Order note <small>optional</small></span><textarea value={customer.note} onChange={event => setCustomer({ ...customer, note: event.target.value })} rows={3} placeholder="Any colour or sizing notes?" /></label></div><button className="button button-green button-wide whatsapp-submit" onClick={sendOrder}><Check size={17} /> Send order on WhatsApp</button><p className="checkout-footnote">Your order details open in WhatsApp so the merchant can confirm availability and delivery.</p></aside></div>}
  </div>;
}
