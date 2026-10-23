import { ArrowUp } from 'lucide-react'

export default function SiteFooter() {
  return <footer className="shell footer">
    <p>© {new Date().getFullYear()} Enkhjin Chuluunkhuu</p>
    <p>Made with curiosity.</p>
    <a href="#top">Back to top <ArrowUp size={15}/></a>
  </footer>
}
