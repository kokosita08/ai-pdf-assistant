// This component shows important usage notes to the user.
// It's integrated into the UI design — not a scary warning box.

export default function Disclaimer() {
  const notes = [
    { icon: "📏", text: "Max file size: 5 MB" },
    { icon: "📝", text: "Only text-based PDFs are supported best" },
    { icon: "🖼️", text: "Large or scanned PDFs may not work properly" },
    { icon: "🤖", text: "Responses are AI-generated and may not always be fully accurate" },
  ];

  return (
    <div className="w-full rounded-3xl bg-cream-100 border border-cream-200 px-5 py-4">
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3">
        Good to know
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {notes.map((note, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0 mt-0.5">{note.icon}</span>
            <p className="text-xs text-ink-500 leading-relaxed">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
