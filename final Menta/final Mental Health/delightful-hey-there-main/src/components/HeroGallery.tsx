import React from "react";

const images = [
  {
    url: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Students supporting each other, mental health",
    tip: "Support a friend—listening matters!"
  },
  {
    url: "https://images.unsplash.com/photo-1503676382389-4809596d5290?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Student talking to counselor, mental health support",
    tip: "Talking helps—reach out when you need."
  },
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Students in a group discussion, mental health awareness",
    tip: "You’re not alone—community is strength."
  }
];

export default function HeroGallery() {
  return (
    <div className="relative flex justify-center items-center py-6 px-2 md:px-0 bg-gradient-to-br from-blue-50/60 to-teal-100/60 rounded-3xl shadow-xl w-full max-w-5xl mx-auto min-h-[260px] md:min-h-[320px]">
      {/* Decorative gradient ring */}
      <div className="absolute -inset-2 rounded-3xl pointer-events-none z-0 bg-gradient-to-r from-teal-200/30 via-blue-200/30 to-transparent blur-xl"></div>
      {/* SVG Brain icon as background */}
      <svg className="absolute z-0 left-8 top-1/2 transform -translate-y-1/2 opacity-30 w-32 h-32 hidden md:block" viewBox="0 0 128 128" fill="none">
        <ellipse cx="64" cy="64" rx="60" ry="48" fill="#5eead4" />
        <ellipse cx="64" cy="64" rx="45" ry="36" fill="#38bdf8" fillOpacity=".3" />
        <path d="M48 64c0-8 8-16 16-16s16 8 16 16-8 16-16 16-16-8-16-16z" fill="#0ea5e9" fillOpacity=".5" />
      </svg>
      {/* SVG chat/message icon as background */}
      <svg className="absolute z-0 right-8 bottom-8 opacity-30 w-28 h-28 hidden md:block" viewBox="0 0 100 100" fill="none">
        <ellipse cx="50" cy="50" rx="45" ry="30" fill="#38bdf8" />
        <rect x="25" y="40" width="50" height="20" rx="10" fill="#fff" fillOpacity=".5" />
        <ellipse cx="40" cy="50" rx="4" ry="4" fill="#0ea5e9" />
        <ellipse cx="50" cy="50" rx="4" ry="4" fill="#0ea5e9" />
        <ellipse cx="60" cy="50" rx="4" ry="4" fill="#0ea5e9" />
      </svg>
      {/* Images, larger and more overlap on desktop */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`relative z-10 w-40 h-28 sm:w-56 sm:h-40 md:w-72 md:h-52 transition-transform duration-300 group ${idx !== 0 ? '-ml-8 sm:-ml-14 md:-ml-24' : ''}`}
          style={{ boxShadow: '0 8px 32px 0 rgba(53, 83, 83, 0.15)' }}
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-teal-200/40 to-blue-200/40 opacity-0 group-hover:opacity-100 blur-md transition-all duration-300 pointer-events-none"></div>
          <img
            src={img.url}
            alt={img.alt}
            className={`object-cover w-full h-full rounded-2xl border-2 border-white group-hover:border-teal-400 group-hover:scale-105 group-hover:-translate-y-2 shadow-xl transition-all duration-300${idx === 1 ? ' animate-bounce-slow' : ''}`}
            loading="lazy"
          />
        </div>
      ))}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
      `}</style>
    </div>
  );
}
