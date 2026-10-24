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

// The projects page: websites I've built. Figures are facts about each project. `image` is a screenshot of the live
// site, which the projects canvas draws in dots.
export type Project = {
  id: string
  title: string
  kind: string
  text: string
  image: string
  details: { label: string, items: string[] }[]
  figures: { value: string, label: string }[]
  stack?: string[]
  link?: { href: string, label: string }
}

export const projects: Project[] = [
  {
    id: 'mcc-website', title: 'Mongolian Cultural Center website', kind: 'Full-stack website', image: '/projects/mcc.webp',
    text: 'A full-stack site for a 501(c)(3) cultural nonprofit, giving our community one place to discover programs, find events, and stay connected, with a publishing dashboard so staff post updates themselves.',
    details: [{ label: 'Role', items: ['Design', 'Full-stack development'] }, { label: 'When', items: ['June 2025 – Present'] }, { label: 'For', items: ['Mongolian Cultural Center in North America'] }],
    figures: [{ value: '400+', label: 'visitors' }, { value: '2,000', label: 'page views' }],
    stack: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Vercel'],
    link: { href: culturalCenterSite, label: 'mongolianculturalcenterna.org' },
  },
  {
    id: 'ag-portfolio', title: 'Amarmend Gantulga portfolio', kind: 'Student portfolio', image: '/projects/ag.webp',
    text: 'A portfolio for Amarmend, a physics student, tutor and community volunteer from Darkhan, Mongolia: “Learning. Giving back.” Five pages on his physics, service, life and résumé.',
    details: [{ label: 'Role', items: ['Design', 'Development'] }, { label: 'For', items: ['Amarmend Gantulga, student'] }],
    figures: [{ value: '5', label: 'pages' }],
    stack: ['Next.js', 'Vercel'],
    link: { href: 'https://agstudent.vercel.app/', label: 'agstudent.vercel.app' },
  },
  {
    id: 'mm-portfolio', title: 'Munkh-Orgil Munkhtulga portfolio', kind: 'Student portfolio', image: '/projects/mm.webp',
    text: 'A portfolio for Munkh-Orgil, a physics olympiad student from Ulaanbaatar: “A mind in motion.” It walks through his competitions, research, service and life, with a gallery of his original certificates.',
    details: [{ label: 'Role', items: ['Design', 'Development'] }, { label: 'For', items: ['Munkh-Orgil Munkhtulga, student'] }],
    figures: [{ value: '6', label: 'pages' }, { value: '24', label: 'certificates shown' }],
    stack: ['Next.js', 'Vercel'],
    link: { href: 'https://mmstudent.vercel.app/', label: 'mmstudent.vercel.app' },
  },
]
