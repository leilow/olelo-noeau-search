interface MetricCardProps {
  label: string;
  value: string | number;
}

const CARD_CLASS = 'bg-white/60 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-text/10 text-center';
const CARD_STYLE = { backgroundColor: 'rgba(251, 179, 157, 0.7)' };
const LABEL_CLASS = 'font-mono text-xs mb-2';
const LABEL_STYLE = { color: '#5a4f3f' };
const VALUE_CLASS = 'text-2xl font-heading font-bold';
const VALUE_STYLE = { color: '#2c2416' };

export default function MetricCard({ label, value }: MetricCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className={CARD_CLASS} style={CARD_STYLE}>
      <div className={LABEL_CLASS} style={LABEL_STYLE}>{label}</div>
      <div className={VALUE_CLASS} style={VALUE_STYLE}>{displayValue}</div>
    </div>
  );
}
