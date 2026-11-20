import * as React from "react"
import { createRoot } from "react-dom/client"
import DoodleCrewFooter from "./doodle-crew-footer"

const mount = document.getElementById("doodle-footer")
if (mount) {
  createRoot(mount).render(
    <DoodleCrewFooter
      wordmark="FIRSTSTEP"
      brand="FirstStep"
      blurb="Fresher and intern jobs across India, collected daily from Adzuna and public career pages. Duplicates are removed and Gemini tags each post by role and city."
      tagline="Every career starts with one small step."
      preset="paper"
      palette={{ background: "#fffaf4", ink: "#0d1b4c", accent: "#f97316" }}
      fontFamily="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif"
      serifFamily="'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif"
      columns={[
        { title: "Explore", links: [{ label: "All jobs", href: "#top" }, { label: "Internships", href: "#list" }, { label: "About this data", href: "#about" }] },
        { title: "Roles", links: [{ label: "Backend", href: "#list" }, { label: "Sales / BD", href: "#list" }, { label: "Finance", href: "#list" }, { label: "Marketing", href: "#list" }] },
      ]}
      actions={[
        { label: "Browse jobs", href: "#top", icon: "bolt", variant: "solid" },
        { label: "Replay intro", icon: "star", variant: "outline", onClick: () => document.getElementById("replay")?.click() },
      ]}
      copyright="© 2026 FirstStep. Roles and cities are AI-tagged and can be wrong, and employment type, experience and work mode are keyword-based guesses. Always check the original post before applying."
      legal={[]}
      socials={[]}
    />,
  )
}