export default function AboutProject() {
  return (
    <section className="bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-sm" style={{ backgroundColor: 'rgba(182, 226, 221, 0.7)' }}>
      <h2 className="text-3xl font-heading font-bold mb-6 text-text" style={{ color: '#2c2416' }}>
        About the Project
      </h2>
      <div className="font-body space-y-5 text-text/85 leading-relaxed" style={{ color: '#3d3424' }}>
        {/* <p className="text-lg"> */}
          <p>This is a searchable database of <em>ʻōlelo noʻeau</em> — poetic Hawaiian sayings that capture the wisdom, values, and cultural knowledge of Native Hawaiians. Mary Kawena Pukui began collecting these sayings from a young age (around 15), and later became a renowned Hawaiian scholar, author, kumu hula (hula teacher), and trailblazer.</p>
          <p>Each entry includes the original Hawaiian text, its English translation, <em>kaona</em> (the deeper or hidden meaning), and additional contextual information. You can search, filter, and browse the collection using tags derived from the index.Please note that there may be some errors in the data; if you find any, we encourage you to report them.</p>
          <p>The original content was published on <strong><a href="https://trussel2.com" target="_blank" rel="noopener noreferrer">trussell.com</a></strong>. The site is fully credited; please continue to give proper acknowledgment. To support the preservation of Hawaiian culture, we recommend purchasing the book as well from <strong><a href="https://bishopmuseumpress.org/products/olelo-no-eau-hawaiian-proverbs-poetical-sayings-1?_pos=1&_sid=c5910c547&_ss=r" target="_blank" rel="noopener noreferrer">Bishop Museum Press</a></strong>.</p>
          <p><a href="https://leiimomii.substack.com/p/hauoli-mahina-olelo-hawaii" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline font-medium">Read more about the project</a> — the story behind this tool, Pukui, and digital stewardship of ʻōlelo noʻeau.</p>
      </div>
    </section>
  );
}
