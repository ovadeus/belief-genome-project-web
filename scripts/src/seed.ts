import { db, blogPostsTable, subscribersTable, earlyBirdTable, adminUsersTable, siteSettingsTable } from "@workspace/db";
import { pool } from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "WhooRU2025!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db
    .insert(adminUsersTable)
    .values({ username: adminUsername, passwordHash })
    .onConflictDoUpdate({ target: adminUsersTable.username, set: { passwordHash } });
  console.log(`Admin user "${adminUsername}" created/updated`);

  const defaultSettings = [
    { key: "tagline", value: "WhooRU? — The only question that has ever really mattered." },
    { key: "appDownloadUrl", value: "#" },
    { key: "twitterUrl", value: "https://twitter.com" },
    { key: "linkedinUrl", value: "https://linkedin.com" },
    { key: "githubUrl", value: "https://github.com" },
  ];

  for (const setting of defaultSettings) {
    await db
      .insert(siteSettingsTable)
      .values(setting)
      .onConflictDoNothing();
  }
  console.log("Default settings created");

  const existingPosts = await db.select().from(blogPostsTable);
  if (existingPosts.length === 0) {
    const posts = [
      {
        title: "The Architecture of Belief: Why Self-Knowledge Is the Missing Variable",
        slug: "architecture-of-belief",
        excerpt: "Every system in the world — from democracy to artificial intelligence — is built on assumptions about what people believe. But we have never actually measured belief. Until now.",
        body: `# The Architecture of Belief

Every system in the world — from democracy to artificial intelligence — is built on assumptions about what people believe. But we have never actually measured belief. Until now.

## The Problem We've Been Ignoring

For centuries, we have built institutions, policies, and technologies on crude proxies for human belief: demographic data, survey responses, voting patterns, purchasing behavior. These proxies tell us *what* people do, but they tell us almost nothing about *why*.

The gap between behavior and belief is where most of civilization's failures live.

## What WhooRU Changes

The Belief Genome framework introduces a new unit of measurement: the psychological dimension. Not a personality trait. Not a preference. A weighted, contextual belief vector that captures how deeply and how broadly a particular conviction shapes your decisions.

With 124 of these dimensions mapped, weighted, and visualized, the Belief Genome becomes the most comprehensive portrait of an individual's inner world ever constructed.

## The Implications

When you can see your belief architecture, several things become possible:

- **Prediction**: Understanding not just who you are, but who you are becoming
- **Alignment**: Building AI systems that genuinely understand your values
- **Resolution**: Navigating conflicts with dimensional precision rather than emotional reactivity
- **Growth**: Tracking your psychological evolution over time

This is not self-help. This is self-science.

> "The unexamined belief does not stay private. It becomes policy. It becomes culture. It becomes the world your children inherit."

The architecture of belief is the foundation of everything. And we are only just beginning to map it.`,
        hashtags: ["belief-genome", "self-knowledge", "psychology", "framework"],
        status: "published",
        publishedAt: new Date("2025-01-15"),
        readTimeMins: 4,
      },
      {
        title: "Why the Forecaster Changes Everything About Personal Decision-Making",
        slug: "forecaster-changes-everything",
        excerpt: "Most self-knowledge tools tell you who you were. The Forecaster tells you who you're about to become — and what you're likely to decide before you even face the choice.",
        body: `# Why the Forecaster Changes Everything

Most self-knowledge tools tell you who you were. The Forecaster tells you who you're about to become — and what you're likely to decide before you even face the choice.

## Beyond Retrospection

Traditional psychological tools — personality tests, therapy frameworks, journaling — are fundamentally retrospective. They help you understand your past patterns. This is valuable, but it is not sufficient.

The Forecaster is prospective. It uses the accumulated architecture of your Belief Genome to generate predictions about how you will respond to situations you haven't encountered yet.

## How It Works

Feed the Forecaster a scenario — a moral dilemma, a career decision, a relationship challenge, a philosophical question — and it returns:

1. **A predicted response** based on your current belief architecture
2. **A confidence score** indicating how strongly your dimensions align
3. **The key dimensions** driving the prediction
4. **Divergence flags** where your stated values may conflict with your actual belief patterns

## Why This Matters

The ability to see your future responses before they happen transforms decision-making from reactive to proactive. You can:

- Prepare for high-stakes moments with genuine self-awareness
- Identify blind spots before they become regrets
- Track how your beliefs are shifting over time
- Understand the gap between who you think you are and who your beliefs reveal you to be

## The Uncomfortable Truth

The Forecaster doesn't always tell you what you want to hear. Sometimes it reveals that your deeply held convictions are less stable than you imagined. Sometimes it shows that the values you proclaim most loudly are the ones your belief architecture supports least.

This is not a flaw. This is the point.

Self-knowledge that only confirms what you already believe is not knowledge — it's comfort. The Forecaster is built for truth, not comfort.`,
        hashtags: ["forecaster", "decision-making", "prediction", "self-knowledge"],
        status: "published",
        publishedAt: new Date("2025-02-01"),
        readTimeMins: 4,
      },
      {
        title: "Wicked Problems and the Belief Variable: A New Framework for Global Challenges",
        slug: "wicked-problems-belief-variable",
        excerpt: "Climate change, political polarization, AI alignment — every wicked problem humanity faces has the same root architecture: unexamined beliefs operating at scale.",
        body: `# Wicked Problems and the Belief Variable

Climate change, political polarization, AI alignment — every wicked problem humanity faces has the same root architecture: unexamined beliefs operating at scale.

## What Makes a Problem Wicked

The term "wicked problem" was coined by design theorists Horst Rittel and Melvin Webber in 1973. A wicked problem is one that:

- Has no definitive formulation
- Has no stopping rule
- Has solutions that are not true-or-false, but good-or-bad
- Cannot be tested — every implementation is a one-shot operation
- Every wicked problem is essentially unique

The climate crisis, political polarization, and the challenge of AI alignment all meet these criteria.

## The Missing Variable

For decades, we have attacked these problems with data, technology, policy, and economics. The needle barely moves. Why?

Because every wicked problem is ultimately a *belief* problem. The reason we cannot agree on climate action is not a lack of evidence — it is a conflict of belief architectures operating beneath conscious awareness.

## What WhooRU Offers

By mapping belief at the individual level and aggregating those maps at scale, WhooRU introduces a variable that has never existed in our problem-solving toolkit: dimensional belief data.

Imagine being able to see:

- Where belief patterns are converging toward dangerous consensus
- Where they are diverging toward irreconcilable fragmentation
- Which psychological dimensions are driving a specific conflict
- How belief architectures shift in response to new information

This is not a complete solution to wicked problems. But it is the missing foundation upon which real solutions can be built.

## The Path Forward

The path forward is not more data about the world. It is more data about ourselves — our beliefs, our assumptions, our invisible architectures of meaning.

WhooRU is building the infrastructure to make that data accessible, measurable, and actionable.

The wicked problems will not solve themselves. But they cannot be solved without understanding the beliefs that sustain them.`,
        hashtags: ["wicked-problems", "climate", "polarization", "framework"],
        status: "published",
        publishedAt: new Date("2025-03-01"),
        readTimeMins: 5,
      },
    ];

    for (const post of posts) {
      await db.insert(blogPostsTable).values(post);
    }
    console.log("Sample blog posts created");
  }

  const existingSubs = await db.select().from(subscribersTable);
  if (existingSubs.length === 0) {
    const subs = [
      { name: "Alex Chen", email: "alex@example.com", source: "newsletter", isActive: true },
      { name: "Sam Rivera", email: "sam@example.com", source: "book", isActive: true },
      { name: "Jordan Lee", email: "jordan@example.com", source: "newsletter", isActive: true },
    ];
    for (const sub of subs) {
      await db.insert(subscribersTable).values(sub);
    }
    console.log("Sample subscribers created");
  }

  const existingEB = await db.select().from(earlyBirdTable);
  if (existingEB.length === 0) {
    const entries = [
      { name: "Morgan Walsh", email: "morgan@example.com" },
      { name: "Casey Brooks", email: "casey@example.com" },
    ];
    for (const entry of entries) {
      await db.insert(earlyBirdTable).values(entry);
    }
    console.log("Sample early bird entries created");
  }

  console.log("Seed complete!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
