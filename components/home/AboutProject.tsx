export default function AboutProject() {
  return (
    <section className="bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-sm" style={{ backgroundColor: 'rgba(182, 226, 221, 0.7)' }}>
      <h2 className="text-3xl font-heading font-bold mb-6 text-text" style={{ color: '#2c2416' }}>
        About the Project
      </h2>
      <div className="font-body space-y-5 text-text/85 leading-relaxed" style={{ color: '#3d3424' }}>
        <p className="text-lg">
          This is a searchable index of ʻōlelo noʻeau — Hawaiian poetical sayings that capture
          the wisdom, values, and cultural knowledge of Native Hawaiians. Mary Kawena Pukui was said to collect these sayings from age 15.
          She went on to become a renowned Hawaiian scholar, author, kumu hula, and badass. 
        </p>
        <p>
          Each phrase includes the original Hawaiian text, English translation, kaona (deeper meaning), and
          contextual information. You can search, filter, and browse via tags, which originate form the index.
          There might be some errors in the data, so please report them if you find any.
        </p>
        <p>
          The data is maintained in a JSON file and serves as the source of truth for all
          phrase content originally published on this website: <a href="https://www.olelonoeau.com" target="_blank" rel="noopener noreferrer">trussell dot come</a>.
          Heʻs been credited; please do the same. And buy the book if you can <a href="https://bishopmuseumpress.org/products/olelo-no-eau-hawaiian-proverbs-poetical-sayings-1?_pos=1&_sid=c5910c547&_ss=r" target="_blank" rel="noopener noreferrer"> from Bishop Museum Press!</a>
        </p>
      </div>
    </section>
  );
}
