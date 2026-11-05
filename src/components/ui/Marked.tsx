/** Renders text where *word* gets the highlighter-pen treatment. No other markup is interpreted. */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={i} className="marker">
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export const stripMarks = (text: string) => text.replace(/\*([^*]+)\*/g, "$1");
