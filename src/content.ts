// Facts and links used in more than one place, and the lists the pages render

export const email = 'enkhjinjeje@gmail.com'
export const resume = '/JejeResume.pdf'
export const linkedIn = 'https://www.linkedin.com/in/enkhjinjeje/'
export const culturalCenterSite = 'https://www.mongolianculturalcenterna.org/'

// Newest first: jobs and the communities I've built. `mark` is the role as the work page draws it in dots: short,
// with a line break where it is long. `section`, `place` and `points` are the résumé's, for recruiter mode.
export const experience = [
  { id: 'intramural', org: 'University of Washington', role: 'Intramural Staff', mark: 'Intramural\nStaff', section: 'Work', place: 'Bothell, WA', date: 'Jan 2026 – Present', text: 'Helping students connect through sport: officiating soccer, basketball, and flag football, supporting campus events, and collaborating on social content. 36 pop-up events, 7 leagues, and 3 tournaments serving 730 unique participants and 2,279 check-ins in 2025–26, and social content driving about 32,000 monthly Instagram page visits.', points: ['Officiate all campus intramural sports, including 3 leagues (soccer, basketball, flag football), ensuring fair play', 'Help run 36 pop-up events, 7 leagues, and 3 tournaments serving 730 unique participants and 2,279 check-ins (2025–26)', 'Collaborate with staff and the marketing team on reels and posts driving ~32,000 monthly Instagram page visits'] },
  { id: 'club', org: 'Fashion and culture club at UW', role: 'Founder & President', mark: 'Founder &\nPresident', section: 'Leadership', place: 'Bothell, WA', date: 'Jun 2025 – Present', text: 'A student-led club at the University of Washington for creativity and self-expression, led by a 9-member board: 50 members, 8 workshops and events, and collaborations with Stitched and the UW Seattle Mongolian Student Association.', points: ['Founded a student-led fashion and culture club fostering creativity, self-expression, and community, growing to 50 members', 'Established the constitution, organizational structure, officer roles, and operating policies, leading a 9-member board and earning recognition as a campus student club', 'Planned and hosted 8 workshops, fashion showcases, and community events with 300+ total attendees, collaborating with Stitched and the UW Seattle Mongolian Student Association'] },
  { id: 'mccna', org: 'Mongolian Cultural Center in North America', role: 'Co-founder', mark: 'Co-founder', section: 'Leadership', place: 'Bothell, WA', date: 'May 2024 – Present', text: 'Preserving culture and opening doors for the next generation through workshops, campus visits, and shared experiences: 10+ college workshops with 300+ total attendees, 8 summer camps, tech campus tours, and a cultural exploration program for 12 high schoolers.', points: ['Co-founded a 501(c)(3) nonprofit preserving Mongolian culture, building ~30 active student and parent members', 'Organized tech campus tours of Amazon, Microsoft, Expedia, Meta, Boeing, and Blue Origin (88 participants at Amazon), managing communications and documentation', 'Hosted 10+ college workshops with 300+ total attendees and 8 summer camps', 'Initiated the Mongolian Identity – Mongolian Talent program, where 12 high schoolers currently explore and present Mongolian culture', 'Built the organization’s website, publishing 6 programs and 22 events and replacing Facebook-only posting'] },
  { id: 'pinecone', org: 'Pinecone Solutions', role: 'Software Development Intern', mark: 'Software\nIntern', section: 'Work', place: 'Bellevue, WA', date: 'Jun – Aug 2022', text: 'Built features for a mobile app mapping commercial and residential addresses in Mongolia, using React, Java, and CSS. The app collected 1,000+ addresses; I implemented Firebase authentication for 5 admin accounts and a React Dropzone image-upload flow handling 100 uploads per day.', points: ['Developed features for a mobile app mapping commercial and residential addresses in Mongolia using React, Java, and CSS, with 1,000+ addresses uploaded', 'Implemented login and user authentication with Firebase, supporting 5 admin accounts', 'Built image-upload functionality with React Dropzone, handling 100 image uploads per day to the application’s database'] },
  { id: 'academy', org: 'Pinecone Academy', role: 'Assistant Teacher', mark: 'Assistant\nTeacher', section: 'Work', place: 'Bellevue, WA', date: 'Jan – May 2022', text: 'Helped 8 students, ages 13–18, turn their first lines of HTML and CSS into working projects: 20+ projects, from front-end websites to full-stack applications and games, with individual CSS guidance and practice researching solutions independently.', points: ['Taught HTML and CSS fundamentals to 8 students ages 13–18, who completed 20+ projects ranging from front-end builds to full-stack applications and video games', 'Gave one-on-one CSS guidance and taught students to find answers independently by researching solutions online'] },
]

// Recruiter mode: who I am at a glance, and the parts of the résumé the pages don't show
export const profile = {
  name: 'Enkhjin “Jeje” Chuluunkhuu',
  headline: 'Computer science student, developer, and community builder',
  location: 'Bothell, Washington',
  summary: 'I study Computer Science at the University of Washington (class of 2028). I build software, teach others to code, and bring people together around shared ideas. I also co-founded the Mongolian Cultural Center in North America and founded a fashion and culture club at UW. I love building communities and making sure everyone in them feels they belong.',
}
export const education = { school: 'University of Washington', place: 'Bothell, WA', degree: 'Bachelor of Computer Science', date: 'Expected June 2028', gpa: '3.4' }
export const resumeSkills = [
  { title: 'Languages', items: 'Java, Python, C++, R, JavaScript (ES6), TypeScript, HTML/CSS, Bash/Shell' },
  { title: 'Frontend', items: 'React, Next.js, Three.js, Tailwind CSS, React Hook Form, React Dropzone' },
  { title: 'Backend & databases', items: 'Firebase, Supabase, MongoDB, MySQL, AWS' },
  { title: 'Tools & platforms', items: 'Git, GitHub, Figma, UI/UX prototyping, Vercel' },
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
  points?: string[]  // the résumé's, for recruiter mode
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
    points: ['Developed a full-stack site for a 501(c)(3) cultural nonprofit using Next.js, React, and Supabase on Vercel, drawing 400+ visitors and 2,000 page views', 'Designed a responsive UI with Tailwind CSS that works across devices with near-instant page loads', 'Built an admin dashboard so staff can publish events and programs without code changes, replacing manual Facebook posts'],
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
  {
    id: 'fitted-uwb', title: 'Fitted UWB website', kind: 'Club website', image: '/projects/fitted.webp',
    text: 'A site for Fitted, the student fashion club I founded at UW Bothell: swaps, bleached tees, DIY nights and outfit hikes. A ring of clothing turns around the logo, and a timeline of posters walks through the year’s events.',
    details: [{ label: 'Role', items: ['Design', 'Development'] }, { label: 'For', items: ['Fitted UWB, student fashion club'] }],
    figures: [{ value: '12', label: 'event posters' }],
    stack: ['Next.js', 'Vercel'],
    link: { href: 'https://fitteduwb.vercel.app/', label: 'fitteduwb.vercel.app' },
  },
]
