// Facts and links used in more than one place, and the lists the sections render

export const email = 'enkhjinjeje@gmail.com'
export const resume = '/JejeResume.pdf'
export const linkedIn = 'https://www.linkedin.com/in/enkhjinjeje/'
export const culturalCenterSite = 'https://www.mongolianculturalcenterna.org/'

export const navigation = ['Work', 'About', 'Experience'] as const

export const experience = [
  { id: 'intramural', company: 'University of Washington', role: 'Intramural Staff', date: 'Jan 2026 – Present', description: 'Helping students connect through sport. Officiating soccer, basketball, and flag football, supporting campus events, and collaborating on social content.', detail: 'Contributed to 36 pop-up events, 7 leagues, and 3 tournaments serving 730 unique participants and 2,279 check-ins in 2025–26. Collaborated on social content driving approximately 32,000 monthly Instagram page visits.' },
  { id: 'pinecone', company: 'Pinecone Solutions', role: 'Software Development Intern', date: 'Jun – Aug 2022', description: 'Built features for a mobile app mapping commercial and residential addresses in Mongolia, using React, Java, and CSS.', detail: 'The app collected 1,000+ addresses. Implemented Firebase authentication for 5 admin accounts and a React Dropzone image-upload flow handling 100 uploads per day.' },
  { id: 'academy', company: 'Pinecone Academy', role: 'Assistant Teacher', date: 'Jan – May 2022', description: 'Helped 8 students, ages 13–18, turn their first lines of HTML and CSS into working projects.', detail: 'Students completed 20+ projects, from front-end websites to full-stack applications and games. Provided individual CSS guidance and taught students to research solutions independently.' },
]

export const skills = [
  { title: 'On the screen', items: 'React, Next.js, TypeScript, JavaScript, Tailwind CSS, Three.js, HTML & CSS' },
  { title: 'Under the surface', items: 'Java, Python, C++, R, Firebase, Supabase, MongoDB, MySQL, AWS' },
  { title: 'From idea to release', items: 'Git, GitHub, Figma, UI/UX prototyping, Vercel, Bash' },
]

export const projectStack = ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Vercel']
