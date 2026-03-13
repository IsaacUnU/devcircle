import { redirect } from 'next/navigation'

// /explore → redirect permanente a /search
export default function ExplorePage() {
  redirect('/search')
}
