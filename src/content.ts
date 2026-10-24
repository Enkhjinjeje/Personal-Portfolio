// Facts and links used in more than one place, and the lists the pages render

export const email = 'enkhjinjeje@gmail.com'
export const resume = '/JejeResume.pdf'
export const linkedIn = 'https://www.linkedin.com/in/enkhjinjeje/'
export const culturalCenterSite = 'https://www.mongolianculturalcenterna.org/'

// Newest first: jobs and the communities I've built
export const experience = [
  { id: 'intramural', org: 'University of Washington', role: 'Intramural Staff', date: 'Jan 2026 – Present', text: 'Helping students connect through sport: officiating soccer, basketball, and flag football, supporting campus events, and collaborating on social content. 36 pop-up events, 7 leagues, and 3 tournaments serving 730 unique participants and 2,279 check-ins in 2025–26, and social content driving about 32,000 monthly Instagram page visits.' },
  { id: 'mccna', org: 'Mongolian Cultural Center in North America', role: 'Co-founder', date: 'May 2024 – Present', text: 'Preserving culture and opening doors for the next generation through workshops, campus visits, and shared experiences: 10+ college workshops with 300+ total attendees, 8 summer camps, tech campus tours, and a cultural exploration program for 12 high schoolers.' },
  { id: 'club', org: 'Fashion and culture club at UW', role: 'Founder & President', date: 'Jun 2024 – Present', text: 'A student-led club at the University of Washington for creativity and self-expression, led by a 9-member board: 50 members, 8 workshops and events, and collaborations with Stitched and the UW Seattle Mongolian Student Association.' },
  { id: 'pinecone', org: 'Pinecone Solutions', role: 'Software Development Intern', date: 'Jun – Aug 2022', text: 'Built features for a mobile app mapping commercial and residential addresses in Mongolia, using React, Java, and CSS. The app collected 1,000+ addresses; I implemented Firebase authentication for 5 admin accounts and a React Dropzone image-upload flow handling 100 uploads per day.' },
  { id: 'academy', org: 'Pinecone Academy', role: 'Assistant Teacher', date: 'Jan – May 2022', text: 'Helped 8 students, ages 13–18, turn their first lines of HTML and CSS into working projects: 20+ projects, from front-end websites to full-stack applications and games, with individual CSS guidance and practice researching solutions independently.' },
]

export const skills = [
  { title: 'On the screen', items: 'React, Next.js, TypeScript, JavaScript, Tailwind CSS, Three.js, HTML & CSS' },
  { title: 'Under the surface', items: 'Java, Python, C++, R, Firebase, Supabase, MongoDB, MySQL, AWS' },
  { title: 'From idea to release', items: 'Git, GitHub, Figma, UI/UX prototyping, Vercel, Bash' },
]

// The projects page: what I've built and started. Every figure comes from the résumé. `details` sit on the left,
// `figures` and `stack` on the card in the middle, `kind`, `title` and `text` on the right.
export type Project = {
  id: string
  title: string
  kind: string
  text: string
  details: { label: string, items: string[] }[]
  figures: { value: string, label: string }[]
  stack?: string[]
  link?: { href: string, label: string }
}

export const projects: Project[] = [
  {
    id: 'mcc-website', title: 'Mongolian Cultural Center website', kind: 'Full-stack website',
    text: 'A full-stack site for a 501(c)(3) cultural nonprofit, giving our community one place to discover programs, find events, and stay connected. The responsive interface works across devices with near-instant page loads.',
    details: [{ label: 'Role', items: ['Design', 'Full-stack development'] }, { label: 'When', items: ['June 2025 – Present'] }, { label: 'For', items: ['Mongolian Cultural Center in North America'] }],
    figures: [{ value: '400+', label: 'visitors' }, { value: '2,000', label: 'page views' }],
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Vercel'],
    link: { href: culturalCenterSite, label: 'mongolianculturalcenterna.org' },
  },
  {
    id: 'publishing-dashboard', title: 'Publishing dashboard', kind: 'Admin tool',
    text: 'An admin dashboard inside the center’s website, so staff publish events and programs themselves without code changes, replacing manual Facebook posts.',
    details: [{ label: 'Role', items: ['Full-stack development'] }, { label: 'When', items: ['June 2025 – Present'] }, { label: 'For', items: ['Mongolian Cultural Center staff'] }],
    figures: [{ value: '6', label: 'programs' }, { value: '22', label: 'events published' }],
    stack: ['Next.js', 'Supabase'],
  },
  {
    id: 'address-app', title: 'Address mapping app', kind: 'Mobile app',
    text: 'Features for a mobile app mapping commercial and residential addresses in Mongolia: Firebase sign-in for the admin accounts and an image-upload flow with React Dropzone.',
    details: [{ label: 'Role', items: ['Software development intern'] }, { label: 'When', items: ['June – August 2022'] }, { label: 'At', items: ['Pinecone Solutions'] }],
    figures: [{ value: '1,000+', label: 'addresses' }, { value: '100', label: 'uploads a day' }],
    stack: ['React', 'Java', 'CSS', 'Firebase', 'React Dropzone'],
  },
  {
    id: 'mongolian-talent', title: 'Mongolian Identity – Mongolian Talent', kind: 'Community program',
    text: 'A program I started at the cultural center, where high schoolers explore Mongolian culture and present what they find.',
    details: [{ label: 'Role', items: ['Started the program'] }, { label: 'For', items: ['Mongolian Cultural Center in North America'] }],
    figures: [{ value: '12', label: 'high schoolers' }],
  },
  {
    id: 'campus-tours', title: 'Tech campus tours', kind: 'Community program',
    text: 'Visits to Amazon, Microsoft, Expedia, Meta, Boeing, and Blue Origin for the center’s students and families. I managed the communications and the documentation.',
    details: [{ label: 'Role', items: ['Organizer'] }, { label: 'For', items: ['Mongolian Cultural Center in North America'] }],
    figures: [{ value: '6', label: 'companies' }, { value: '88', label: 'on the Amazon tour' }],
  },
]
