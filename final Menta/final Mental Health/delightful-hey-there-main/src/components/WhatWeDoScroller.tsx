import React from "react";

const images = [
  // Unsplash images relevant to student mental health, positivity, and support
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80", // students smiling
  "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=400&q=80", // support group
  "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80", // positive teacher
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80", // friends together
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80", // group of students smiling
];

type ScrollerItem =
  | { type: 'img'; src: string; alt: string }
  | { type: 'text'; value: string };

const scrollerItems: ScrollerItem[] = [
  ...images.map((img, i) => ({ type: "img" as const, src: img, alt: `Mental health ${i + 1}` })),
  { type: "text" as const, value: "What we do" },
  { type: "text" as const, value: "Support Students" },
  { type: "text" as const, value: "Empower Minds" },
];

export default function WhatWeDoScroller() {
  // Double the content for seamless looping
  const allItems = [...scrollerItems, ...scrollerItems];
  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 py-7">
      <div
        className="flex items-center animate-scroll-x gap-6 min-w-max"
        style={{ width: '200%' }}
      >
        {allItems.map((item, idx) =>
          item.type === 'img' ? (
            <img
              key={`img-${idx}`}
              src={item.src}
              alt={item.alt}
              className="rounded-xl object-cover w-24 h-24 shadow-md border-4 border-white"
              draggable={false}
            />
          ) : (
            <span
              key={`text-${idx}`}
              className="text-5xl font-extrabold text-white whitespace-nowrap mx-2 drop-shadow"
            >
              {item.value}
            </span>
          )
        )}
      </div>
      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 24s linear infinite;
        }
      `}</style>
    </div>
  );
}
