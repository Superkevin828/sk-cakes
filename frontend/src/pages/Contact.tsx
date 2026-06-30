import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquareText, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../utils';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message })
      });
      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Contact Us</h1>
        <p className="text-slate-400 text-sm md:text-base">
          Reach out to our teams in Jinja and Bugembe, Uganda. We are ready to make your celebration delicious!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info column */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Our Global Presence</h2>
          
          {/* Jinja Branch Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="text-base">🇺🇬</span> Jinja Branch (Headquarters)
            </div>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>Bugembe, Jinja-Iganga Highway, Jinja, Uganda</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <a href="tel:+256760593042" className="hover:text-amber-400 transition">+256 760 593 042 / +256 700 235 315</a>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>info@skcakes.com</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>Mon - Sat: 7:30 AM - 9:00 PM <br />Sunday: 10:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Bugembe Delivery Outlet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="text-base">🚚</span> Bugembe Outlet & Delivery
            </div>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>Jinja-Iganga Highway, Bugembe, Jinja, Uganda</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <a href="tel:+256700235315" className="hover:text-amber-400 transition">+256 700 235 315 / +256 760 593 042</a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span className="font-bold text-amber-400">Delivery Schedule: Today or in 2 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <MessageSquareText className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Send Us a Message</h2>
              <p className="text-xs text-slate-400 mt-0.5">We respond to custom food & cake quotes within 2 hours.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Your Name *</label>
                <input
                  id="contact-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Email Address *</label>
                <input
                  id="contact-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Phone Number</label>
                <input
                  id="contact-phone-input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                  placeholder="e.g. +256 771 234567"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Subject *</label>
                <input
                  id="contact-subject-input"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                  placeholder="e.g. Wedding Cake Quotation"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">Your Message *</label>
              <textarea
                id="contact-message-input"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                placeholder="Write your beautiful query or special order description..."
              />
            </div>

            <button
              id="contact-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow shadow-amber-500/10"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Sending...' : 'Submit Message'}
            </button>

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Your message has been sent successfully! Our Jinja team will review and reply via email.
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
