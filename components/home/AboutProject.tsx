export default function AboutProject() {
  return (
    <section className="bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-sm" style={{ backgroundColor: 'rgba(182, 226, 221, 0.7)' }}>
      <h2 className="text-3xl font-heading font-bold mb-6 text-text" style={{ color: '#2c2416' }}>
        About the Project
      </h2>
      <div className="font-body space-y-5 text-text/85 leading-relaxed" style={{ color: '#3d3424' }}>
        <p className="text-lg">
          This is a searchable index of ʻōlelo noʻeau — Hawaiian poetical sayings that capture
          the wisdom, values, and cultural knowledge of Native Hawaiians.
        </p>
        <p>
          Each phrase includes the original Hawaiian text, English translation, meaning, and
          contextual information. You can search, filter, and browse through these timeless
          expressions of Hawaiian culture.
        </p>
        <p>
          The data is maintained in a JSON file and serves as the source of truth for all
          phrase content. This ensures accuracy and allows for easy updates and contributions.
        </p>
      </div>
    </section>
  );
}
