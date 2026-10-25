'use client'

import { createContext, useContext, useRef, useState, type MutableRefObject, type ReactNode } from 'react'

// Which of the head's stories is open, shared by the head (its icons) and the card (which shows it)
type MindStory = {
  selected: number | null
  select(i: number | null): void
  // the head's icons, so closing a story can hand focus back to the one that opened it
  icons: MutableRefObject<(HTMLButtonElement | null)[]>
}
const MindStoryContext = createContext<MindStory | null>(null)
export const useMindStory = () => useContext(MindStoryContext)

export function MindStoryProvider({ children }: { children: ReactNode }) {
  const [selected, select] = useState<number | null>(null)
  const icons = useRef<(HTMLButtonElement | null)[]>([])
  return <MindStoryContext.Provider value={{ selected, select, icons }}>{children}</MindStoryContext.Provider>
}
