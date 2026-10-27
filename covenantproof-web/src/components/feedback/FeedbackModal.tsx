"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquarePlus,
  X,
  Send,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  HelpCircle,
  AlertCircle
} from "lucide-react";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [contact, setContact] = useState(""); // Email or LinkedIn
  const [role, setRole] = useState(""); // Recruiter, Staff Eng, etc.
  const [verdict, setVerdict] = useState<"ready" | "questions" | "critique">("ready");
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const distinctId = contact.trim() || `anon_${Date.now()}`;

    // 1. Deanonymize the visitor in PostHog
    if (contact.trim()) {
      posthog.identify(distinctId, {
        name: name.trim() || "Anonymous Reviewer",
        contact: contact.trim(),
        role: role.trim() || "Not Specified",
        preferred_verdict: verdict,
      });
    }

    // 2. Capture the feedback event with full payload
    posthog.capture("peer_review_submitted", {
      reviewer_name: name,
      reviewer_contact: contact,
      reviewer_role: role,
      technical_verdict: verdict,
      feedback_text: comment,
      timestamp: new Date().toISOString(),
    });

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setName("");
      setContact("");
      setRole("");
      setComment("");
    }, 2800);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right of Screen) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-indigo-400/30 transition-transform hover:scale-105 active:scale-95"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>Peer Review / Recruiter Notes</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight">Architecture Peer Review</h3>
                  <Badge className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px]">
                    Direct to Shivam
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reviewing as a hiring manager, recruiter, or engineer? Share your feedback or critique.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-in zoom-in">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100">Feedback Transmitted</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you for reviewing the architecture. Your feedback and session trace have been logged directly in PostHog.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">

                {/* Quick Verdict Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Your Initial Verdict</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVerdict("ready")}
                      className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-colors ${
                        verdict === "ready"
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-medium"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Production Ready</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerdict("questions")}
                      className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-colors ${
                        verdict === "questions"
                          ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-medium"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Have Questions</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerdict("critique")}
                      className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-colors ${
                        verdict === "critique"
                          ? "bg-amber-950/40 border-amber-500 text-amber-300 font-medium"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Tech Critique</span>
                    </button>
                  </div>
                </div>

                {/* Identity Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Role / Company (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Staff Eng @ Stripe"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Contact Input with Native Inline SVG */}
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Email or LinkedIn URL (Optional, but let&apos;s connect!)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="linkedin.com/in/... or email@company.com"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    {/* Inline LinkedIn SVG Logo */}
                    <svg
                      className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 1.64 1.64 1.64 1.64 0 0 0-1.64-1.64Z" />
                    </svg>
                  </div>
                </div>

                {/* Feedback Comment */}
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Technical Feedback / Thoughts on Architecture
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="What did you think of the deterministic math vs LLM approach, scaling model, or UI?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500">
                    🔒 Telemetry captured via PostHog
                  </span>
                  <Button
                    type="submit"
                    disabled={loading || !comment.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-4 font-semibold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Submit Review
                  </Button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
