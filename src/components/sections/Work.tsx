import { ArrowUpRight, Plus } from 'lucide-react'
import { culturalCenterSite, projectStack } from '../../content'

export default function Work() {
  return <section className="work-section shell" id="work" aria-labelledby="work-heading">
    <div className="section-heading"><h2 id="work-heading">Built with purpose.</h2><p>Software with people at the center.</p></div>
    <article className="featured-work">
      <a className="project-visual" href={culturalCenterSite} target="_blank" rel="noreferrer" aria-label="Visit the Mongolian Cultural Center website (opens in a new tab)">
        <div className="browser-frame">
          <div className="browser-toolbar"><span className="window-dots" aria-hidden="true"><i/><i/><i/></span><span>mongolianculturalcenterna.org</span><ArrowUpRight size={13}/></div>
          <img src="/cultural-center.webp" alt="The live Mongolian Cultural Center website showing its community celebration and cultural programs" width="1440" height="1000" loading="lazy"/>
        </div>
        <span className="visit-project">Visit website <ArrowUpRight size={19}/></span>
      </a>
      <div className="project-info">
        <h3>A digital home<br/>for our culture.</h3>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-secondary"><span>Full-stack development</span><span>2025 – Present</span></div>
        <p>I built the Mongolian Cultural Center’s website to give our community a place to discover programs, find events, and stay connected.</p>
        <p>A custom admin dashboard lets staff publish updates themselves, moving the organization beyond Facebook-only posting.</p>
        <dl className="project-metrics grid grid-cols-2 gap-6"><div><dt>Visitors</dt><dd>400+</dd></div><div><dt>Page views</dt><dd>2,000</dd></div></dl>
        <ul className="tech-list flex flex-wrap gap-x-5 gap-y-2" aria-label="Project technologies">{projectStack.map(t => <li key={t}>{t}</li>)}</ul>
        <details className="project-details">
          <summary>Behind the build <Plus size={18}/></summary>
          <div>
            <p><strong>My contribution.</strong> Responsive interfaces, the full-stack site, and the publishing dashboard. The website brings together 6 programs and 22 events.</p>
            <p><strong>Why it matters.</strong> Staff can keep the community informed without requesting code changes for each update.</p>
          </div>
        </details>
      </div>
    </article>
    <a className="earlier-work" href="#pinecone"><span>Earlier work</span><div><h3>Mapping places in Mongolia.</h3><p>Address discovery, authentication, and image uploads at Pinecone Solutions.</p></div><ArrowUpRight size={28}/></a>
  </section>
}
