import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Star, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import type { PaymentCard, Page } from '../../shared/types';
import { getPaymentCards, savePaymentCards, addPaymentCard, deletePaymentCard, generateId } from '../../shared/storage';

interface PaymentVaultProps {
  navigateTo: (page: Page) => void;
}

// ─── Luhn algorithm ───
function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function maskCard(num: string): string {
  const d = num.replace(/\D/g, '');
  return `•••• •••• •••• ${d.slice(-4) || '????'}`;
}

function formatCardInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

const EMPTY_FORM = {
  nickname: '', cardholderName: '', cardNumber: '',
  expiryMonth: '', expiryYear: '', cvv: '',
  billingAddress: '', billingCity: '', billingZip: '', billingCountry: '',
};

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-muted-dark tracking-wider">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

export default function PaymentVault({ navigateTo }: PaymentVaultProps) {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBilling, setShowBilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getPaymentCards().then(c => { setCards(c); setIsLoading(false); });
  }, []);

  const f = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nickname.trim())        errs.nickname = 'Required';
    if (!form.cardholderName.trim())  errs.cardholderName = 'Required';
    const digits = form.cardNumber.replace(/\D/g, '');
    if (!digits)                      errs.cardNumber = 'Required';
    else if (!luhnCheck(digits))      errs.cardNumber = 'Invalid card number';
    const mm = parseInt(form.expiryMonth, 10);
    const yyyy = parseInt(form.expiryYear, 10);
    const now = new Date();
    if (!form.expiryMonth || mm < 1 || mm > 12) errs.expiryMonth = 'Invalid (1–12)';
    if (!form.expiryYear || yyyy < now.getFullYear()) errs.expiryYear = 'Invalid year';
    if (yyyy === now.getFullYear() && mm < now.getMonth() + 1) errs.expiryMonth = 'Card expired';
    if (!form.cvv || !/^\d{3,4}$/.test(form.cvv)) errs.cvv = '3–4 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const rawDigits = form.cardNumber.replace(/\D/g, '');
    const patch = {
      nickname: form.nickname,
      cardholderName: form.cardholderName,
      cardNumber: rawDigits,
      expiryMonth: form.expiryMonth.padStart(2, '0'),
      expiryYear: form.expiryYear,
      cvv: form.cvv,
      billingAddress: form.billingAddress,
      billingCity: form.billingCity,
      billingZip: form.billingZip,
      billingCountry: form.billingCountry,
    };
    if (editingId) {
      const updated = cards.map(c => c.id === editingId ? { ...c, ...patch } : c);
      await savePaymentCards(updated);
      setCards(updated);
    } else {
      const card: PaymentCard = {
        ...patch,
        id: generateId(),
        isDefault: cards.length === 0,
        createdAt: Date.now(),
      };
      await addPaymentCard(card);
      setCards(prev => [...prev, card]);
    }
    setIsSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this card?')) return;
    await deletePaymentCard(id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
    await savePaymentCards(updated);
    setCards(updated);
  };

  const startEdit = (card: PaymentCard) => {
    setForm({
      nickname: card.nickname,
      cardholderName: card.cardholderName,
      cardNumber: formatCardInput(card.cardNumber),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: card.cvv,
      billingAddress: card.billingAddress || '',
      billingCity: card.billingCity || '',
      billingZip: card.billingZip || '',
      billingCountry: card.billingCountry || '',
    });
    setEditingId(card.id);
    setErrors({});
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
    setShowBilling(false);
  };

  if (isLoading) return <div className="p-4"><div className="shimmer h-12 w-full rounded-xl"></div></div>;

  return (
    <div className="flex flex-col h-full space-y-4 pt-1 pb-6 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Cards</h2>
          <button
            className="text-[10px] text-primary-400 hover:underline mt-0.5"
            onClick={() => navigateTo('passwordVault')}
          >
            Switch to Passwords →
          </button>
        </div>
        {!showForm && (
          <button className="btn-secondary !py-1.5 !px-3" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Add Card
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="glass-card-static p-4 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{editingId ? 'Edit Card' : 'New Card'}</span>
            <button className="btn-ghost !p-1 text-lg leading-none" onClick={resetForm}>✕</button>
          </div>

          <FormField label="Nickname" error={errors.nickname}>
            <input className="glass-input !py-1.5" placeholder='Visa ending 4242' value={form.nickname} onChange={f('nickname')} />
          </FormField>

          <FormField label="Cardholder Name" error={errors.cardholderName}>
            <input className="glass-input !py-1.5" placeholder="John Doe" value={form.cardholderName} onChange={f('cardholderName')} />
          </FormField>

          <FormField label="Card Number" error={errors.cardNumber}>
            <input
              className="glass-input !py-1.5 font-mono tracking-widest"
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              value={form.cardNumber}
              maxLength={19}
              onChange={e => setForm(prev => ({ ...prev, cardNumber: formatCardInput(e.target.value) }))}
            />
          </FormField>

          <div className="grid grid-cols-3 gap-2">
            <FormField label="Month (MM)" error={errors.expiryMonth}>
              <input className="glass-input !py-1.5" placeholder="MM" inputMode="numeric" maxLength={2}
                value={form.expiryMonth} onChange={e => setForm(p => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, '') }))} />
            </FormField>
            <FormField label="Year (YYYY)" error={errors.expiryYear}>
              <input className="glass-input !py-1.5" placeholder="YYYY" inputMode="numeric" maxLength={4}
                value={form.expiryYear} onChange={e => setForm(p => ({ ...p, expiryYear: e.target.value.replace(/\D/g, '') }))} />
            </FormField>
            <FormField label="CVV" error={errors.cvv}>
              <input className="glass-input !py-1.5" type="password" placeholder="•••" inputMode="numeric" maxLength={4}
                value={form.cvv} onChange={e => setForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))} />
            </FormField>
          </div>

          {/* Billing address (collapsible) */}
          <button
            className="w-full flex items-center justify-between text-xs text-muted-light py-1"
            onClick={() => setShowBilling(v => !v)}
          >
            <span>Billing Address (optional)</span>
            {showBilling ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showBilling && (
            <div className="grid grid-cols-2 gap-2 animate-slide-up">
              <div className="col-span-2">
                <input className="glass-input !py-1.5" placeholder="Street address"
                  value={form.billingAddress} onChange={f('billingAddress')} />
              </div>
              <input className="glass-input !py-1.5" placeholder="City" value={form.billingCity} onChange={f('billingCity')} />
              <input className="glass-input !py-1.5" placeholder="ZIP" value={form.billingZip} onChange={f('billingZip')} />
              <div className="col-span-2">
                <input className="glass-input !py-1.5" placeholder="Country" value={form.billingCountry} onChange={f('billingCountry')} />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button className="btn-primary flex-1 !py-2" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId ? 'Update Card' : 'Save Card'}
            </button>
            <button className="btn-secondary !py-2 !px-4" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* Card list */}
      {cards.length === 0 && !showForm ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0D1829]/30 rounded-2xl border border-dashed border-[rgba(255,255,255,0.09)]">
          <div className="w-12 h-12 bg-[#112035] rounded-full flex items-center justify-center text-muted mb-3">
            <CreditCard size={20} />
          </div>
          <h3 className="font-semibold mb-1">No cards saved</h3>
          <p className="text-xs text-muted-light">Add a payment card to auto-fill checkout forms.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => (
            <div key={card.id} className={`glass-card p-4 ${card.isDefault ? 'border-yellow-500/30 bg-yellow-500/5' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{card.nickname}</span>
                    {card.isDefault && <span className="badge badge-amber !text-[9px]">★ Default</span>}
                  </div>
                  <p className="font-mono text-xs text-muted-light tracking-widest">{maskCard(card.cardNumber)}</p>
                  <p className="text-[10px] text-muted mt-1">
                    {card.cardholderName} · {card.expiryMonth}/{card.expiryYear.slice(-2)} · CVV •••
                  </p>
                </div>
                <CreditCard size={20} className="text-muted shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(255,255,255,0.09)]">
                {!card.isDefault && (
                  <button className="btn-ghost !py-1 !px-2 !text-[11px]" onClick={() => handleSetDefault(card.id)}>
                    <Star size={11} /> Default
                  </button>
                )}
                <button className="btn-ghost !py-1 !px-2 !text-[11px]" onClick={() => startEdit(card)}>
                  <Edit2 size={11} /> Edit
                </button>
                <button
                  className="btn-ghost !py-1 !px-2 !text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                  onClick={() => handleDelete(card.id)}
                >
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
