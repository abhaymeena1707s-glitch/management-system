import React from 'react';
import { HelpCircle, BookOpen, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export const HelpSupport = () => {
  const faqs = [
    {
      q: 'How is overdue fine calculated automatically?',
      a: 'The system checks the return date against the due date. If returned after due date, fine = overdue days * configured fine rate per day (default ₹5/day).',
    },
    {
      q: 'What happens when a book has 0 available copies?',
      a: 'The book status changes to "Out of Stock". Members can place a Reservation on the book, which places them in a reservation queue.',
    },
    {
      q: 'Can a librarian delete a book or member?',
      a: 'Deletion of records requires Admin privileges and enforces safe deletion checks (e.g. verifying no active issued copies exist).',
    },
    {
      q: 'How do I export overdue report files?',
      a: 'Navigate to the Reports page and click "Export Overdue CSV" to download formatted spreadsheet data.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Help & Support Documentation</h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          User manual, operational guidelines, and system support contacts.
        </p>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Support Email</p>
            <h4 className="font-bold text-slate-800 text-sm">support@library.com</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Help Desk Hotline</p>
            <h4 className="font-bold text-slate-800 text-sm">+91 98765 43210</h4>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-800 text-lg border-b pb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Q: {faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
