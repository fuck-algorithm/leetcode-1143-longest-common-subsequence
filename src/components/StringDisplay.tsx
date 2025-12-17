import './StringDisplay.css';

interface StringDisplayProps {
  text: string;
  label: string;
  highlightIndices: number[];
}

export function StringDisplay({ text, label, highlightIndices }: StringDisplayProps) {
  return (
    <div className="string-display">
      <span className="label">{label}:</span>
      <div className="chars">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className={`char ${highlightIndices.includes(index) ? 'highlight' : ''}`}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
