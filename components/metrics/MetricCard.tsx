interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  subvalue?: string | number;
}

const CARD_CLASS = 'bg-white/60 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-text/10 text-center';
const CARD_STYLE = { backgroundColor: 'rgba(251, 179, 157, 0.7)' };
const LABEL_CLASS = 'font-mono text-xs mb-2';
const LABEL_STYLE = { color: '#5a4f3f' };
const VALUE_CLASS = 'text-2xl font-heading font-bold';
const VALUE_STYLE = { color: '#2c2416' };

export default function MetricCard({ label, value, sublabel, subvalue }: MetricCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
  const displaySubvalue =
    subvalue !== undefined
      ? typeof subvalue === 'number'
        ? subvalue.toLocaleString()
        : subvalue
      : null;
  return (
    <div className={CARD_CLASS} style={CARD_STYLE}>
      <div className={LABEL_CLASS} style={LABEL_STYLE}>{label}</div>
      <div className={VALUE_CLASS} style={VALUE_STYLE}>{displayValue}</div>
      {sublabel != null && displaySubvalue != null && (
        <>
          <div className={`${LABEL_CLASS} mt-3`} style={LABEL_STYLE}>
            {sublabel}
          </div>
          <div className="text-xl font-heading font-bold" style={VALUE_STYLE}>
            {displaySubvalue}
          </div>
        </>
      )}
    </div>
  );
}
