import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiChevronDown, FiCheckCircle } from 'react-icons/fi';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Student', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', role: 'Student', message: '' });
  };

  const faqs = [
    { q: 'How does AttendPro prevent proxy attendance?', a: 'AttendPro uses session-specific dynamic codes and geofencing verification so attendance can only be logged by active attendees in designated class zones.' },
    { q: 'What happens if a student drops below 75% attendance?', a: 'The system automatically triggers early warnings to the student, flags the profile for the faculty instructor, and lists them in the Admin At-Risk roster.' },
    { q: 'Can faculty export attendance data for university reports?', a: 'Yes! Instructors and administrators can export filtered attendance data to CSV and PDF formats with a single click.' },
    { q: 'Does AttendPro support mobile browsers?', a: 'Absolutely. The platform is fully responsive and optimized for smartphones, tablets, and desktop workstations.' }
  ];

  return (
    <section id="contact" className="py-20 bg-slate-950/80 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Get in Touch</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
            Have Questions? We're Here to Help
          </h3>
          <p className="text-slate-400 text-sm sm:text-base">
            Reach out to our campus implementation team or browse frequently asked questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-8 border-slate-800 relative">
              <h4 className="text-xl font-bold text-white mb-6">Send Us a Message</h4>
              
              {submitted ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
                  <FiCheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h5 className="text-lg font-bold text-white">Message Sent Successfully!</h5>
                  <p className="text-xs text-slate-300">Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="input-group mb-0">
                      <label className="input-label">Full Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Alex Rivera"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div className="input-group mb-0">
                      <label className="input-label">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="alex@univ.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  <div className="input-group mb-0">
                    <label className="input-label">I am a...</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-field text-xs bg-slate-900"
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty Teacher">Faculty / Instructor</option>
                      <option value="Administrator">University Administrator</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="input-group mb-0">
                    <label className="input-label">Message</label>
                    <textarea 
                      rows="4" 
                      required
                      placeholder="How can we assist you with AttendPro?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full py-3 text-xs font-semibold">
                    <FiSend className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Info & FAQ Accordion */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Info */}
            <div className="glass-panel p-6 border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Channels</h4>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400">
                  <FiMail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Support Email</span>
                  <span className="font-medium text-white">support@attendpro-campus.edu</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-cyan-600/20 text-cyan-400">
                  <FiPhone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Helpdesk Phone</span>
                  <span className="font-medium text-white">+1 (800) 555-ATTEND</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Headquarters</span>
                  <span className="font-medium text-white">Academic Innovation Center, Tech Campus</span>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="glass-panel p-6 border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Frequently Asked Questions</h4>
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-800/80 pb-2 last:border-0">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-left flex items-center justify-between py-2 text-xs font-semibold text-slate-200 hover:text-indigo-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${activeFaq === idx ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`} />
                  </button>
                  {activeFaq === idx && (
                    <p className="text-[11px] text-slate-400 py-1 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
