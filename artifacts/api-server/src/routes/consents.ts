import { Router, type IRouter, type Request } from "express";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db, consentAgreementsTable } from "@workspace/db";
import { CreateConsentBody, ListConsentsQueryParams } from "@workspace/api-zod";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const IP_SALT = process.env.IP_HASH_SALT || "bgp-consent-fallback-salt";
function ipHash(req: Request): string {
  const raw = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
  return createHash("sha256").update(IP_SALT + raw).digest("hex").slice(0, 32);
}

const consentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please try again later" },
});

router.post("/consent", consentLimiter, async (req, res): Promise<void> => {
  const parsed = CreateConsentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Valid email and explicit agreement are required" });
    return;
  }

  const { email, agreed, source } = parsed.data;
  if (!agreed) {
    res.status(400).json({ error: "You must check the agreement box to submit." });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userAgent = (req.headers["user-agent"] || "").slice(0, 500);

  // Atomic insert — relies on UNIQUE INDEX on email to prevent races.
  const inserted = await db
    .insert(consentAgreementsTable)
    .values({
      email: normalizedEmail,
      source: source || "web",
      ipHash: ipHash(req),
      userAgent: userAgent || null,
    })
    .onConflictDoNothing({ target: consentAgreementsTable.email })
    .returning({ id: consentAgreementsTable.id });

  if (inserted.length === 0) {
    res.status(409).json({ error: "We already have a consent agreement on file for this email." });
    return;
  }

  res.status(201).json({ message: "Thank you. Your consent has been recorded." });
});

router.get("/admin/consents", requireAuth as any, async (req, res): Promise<void> => {
  const params = ListConsentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const page = Math.max(1, params.data.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.data.limit ?? 25));
  const search = params.data.search;
  const offset = (page - 1) * limit;

  const whereClause = search ? ilike(consentAgreementsTable.email, `%${search}%`) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(consentAgreementsTable)
    .where(whereClause);
  const total = countResult?.count ?? 0;

  const consents = await db
    .select()
    .from(consentAgreementsTable)
    .where(whereClause)
    .orderBy(desc(consentAgreementsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    consents: consents.map((c) => ({
      id: c.id,
      email: c.email,
      status: c.status,
      source: c.source,
      createdAt: c.createdAt,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.delete("/admin/consents/:id", requireAuth as any, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  await db.delete(consentAgreementsTable).where(eq(consentAgreementsTable.id, id));
  res.status(204).end();
});

// Quote a CSV cell and neutralize spreadsheet formula-injection
// (=, +, -, @, tab, CR) by prefixing a single quote per OWASP guidance.
function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

router.get("/admin/consents/export", requireAuth as any, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(consentAgreementsTable)
    .orderBy(desc(consentAgreementsTable.createdAt));

  const header = "id,email,status,source,created_at\n";
  const csv =
    header +
    rows
      .map((r) =>
        [
          csvCell(r.id),
          csvCell(r.email),
          csvCell(r.status),
          csvCell(r.source),
          csvCell(r.createdAt.toISOString()),
        ].join(","),
      )
      .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="consent-agreements-${new Date().toISOString().slice(0, 10)}.csv"`,
  );
  res.send(csv);
});

export default router;
