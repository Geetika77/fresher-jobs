import * as React from "react";
import { createRoot } from "react-dom/client";
import { CinematicHero } from "./cinematic-hero";

const mount = document.getElementById("cinematic-hero");
if (mount) {
  createRoot(mount).render(
    <CinematicHero
      brandName="FirstStep"
      tagline1="Find your first job,"
      tagline2="not just another listing."
      cardHeading="Jobs, curated daily."
      cardDescription={
        <>
          <span style={{ color: "#fff", fontWeight: 600 }}>FirstStep</span> collects fresher jobs and internships across India every day, removes duplicates, and tags them by role and city so you can focus on applying.
        </>
      }
      metricValue={1240}
      metricLabel="Open Roles"
      ctaHeading="Start your search."
      ctaDescription="Browse thousands of fresher and internship roles updated daily from public sources across India."
    />
  );
}
