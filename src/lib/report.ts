import { and, asc, eq, gte, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { chairTestResults, exerciseLogs, medications, medicationLogs, elders } from "../db/schema.js";
import { toUtcDateString } from "./dates.js";

type Period = "week" | "month";
type ChairTrend = "improving" | "stable" | "declining";

function rangeDays(period: Period): number {
  return period === "month" ? 30 : 7;
}

// Rolling window (last N days including today), same convention as B5.3's
// exercise_history/medication_adherence_trend — not a calendar month, for
// consistency across the API rather than introducing a second definition
// of "period." Upper bound is exclusive (tomorrow 00:00 UTC), not an
// inclusive same-day Date, to avoid the JS-Date-vs-timestamptz precision
// mismatch already caught and fixed in B4.3's cursor pagination.
function dateRange(days: number) {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const queryFrom = new Date(todayStart.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const queryToExclusive = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  return {
    queryFrom,
    queryToExclusive,
    fromStr: toUtcDateString(queryFrom),
    toStr: toUtcDateString(todayStart),
  };
}

export async function computeReport(elderId: string, period: Period) {
  const days = rangeDays(period);
  const { queryFrom, queryToExclusive, fromStr, toStr } = dateRange(days);

  const [elder] = await db.select().from(elders).where(eq(elders.id, elderId));
  const honorific = elder?.honorific ?? "Eyang";

  const [chairRows, exerciseRows, activeMeds, medLogRows] = await Promise.all([
    db
      .select()
      .from(chairTestResults)
      .where(
        and(
          eq(chairTestResults.elderId, elderId),
          gte(chairTestResults.recordedAt, queryFrom),
          lt(chairTestResults.recordedAt, queryToExclusive),
        ),
      )
      .orderBy(asc(chairTestResults.recordedAt)),
    db
      .select()
      .from(exerciseLogs)
      .where(
        and(eq(exerciseLogs.elderId, elderId), gte(exerciseLogs.completedAt, queryFrom), lt(exerciseLogs.completedAt, queryToExclusive)),
      ),
    db.select().from(medications).where(and(eq(medications.elderId, elderId), eq(medications.active, true))),
    db
      .select()
      .from(medicationLogs)
      .where(
        and(eq(medicationLogs.elderId, elderId), gte(medicationLogs.takenAt, queryFrom), lt(medicationLogs.takenAt, queryToExclusive)),
      ),
  ]);

  const exerciseDates = new Set(exerciseRows.map((r) => toUtcDateString(r.completedAt)));
  const chairDates = new Set(chairRows.map((r) => toUtcDateString(r.recordedAt)));
  const medDates = new Set(medLogRows.map((r) => toUtcDateString(r.takenAt)));
  const engagementDates = new Set([...exerciseDates, ...chairDates, ...medDates]);
  const consistencyPct = Math.round((engagementDates.size / days) * 100);

  const exercise = { completed_days: exerciseDates.size, total_days: days };

  const scheduledPerDay = activeMeds.reduce((sum, m) => sum + m.scheduleTimes.length, 0);
  const totalScheduled = scheduledPerDay * days;
  const medicationAdherencePct = totalScheduled > 0 ? Math.round((medLogRows.length / totalScheduled) * 100) : null;

  let chairTestTrend: ChairTrend = "stable";
  if (chairRows.length >= 2) {
    const first = chairRows[0]!.reps;
    const last = chairRows[chairRows.length - 1]!.reps;
    if (last > first) chairTestTrend = "improving";
    else if (last < first) chairTestTrend = "declining";
  }

  const isZeroData = consistencyPct === 0;
  const highlights: string[] = [];
  const areasNeedingSupport: string[] = [];
  let headline: string;

  if (isZeroData) {
    headline = `${honorific} is just getting started`;
  } else if (consistencyPct >= 70) {
    headline = `${honorific} had a great ${period}!`;
  } else if (consistencyPct >= 40) {
    headline = `${honorific} is making progress this ${period}`;
  } else {
    headline = `${honorific} could use a little extra encouragement this ${period}`;
  }

  // Highlights are opt-in per category — only added when there's genuinely
  // good news, never spun from a bad number. Zero-data elders get no
  // highlights/areas at all, just the gentle headline above.
  if (!isZeroData) {
    if (exercise.completed_days > 0) {
      highlights.push(`Exercised ${exercise.completed_days} of ${exercise.total_days} days`);
    }
    if (chairTestTrend === "improving") {
      highlights.push(`Chair test reps up from ${chairRows[0]!.reps} to ${chairRows[chairRows.length - 1]!.reps}`);
    } else if (chairTestTrend === "stable" && chairRows.length > 0) {
      highlights.push(`Chair test steady at ${chairRows[chairRows.length - 1]!.reps} reps`);
    }
    if (medicationAdherencePct !== null && medicationAdherencePct >= 80) {
      highlights.push(`Medication adherence at ${medicationAdherencePct}% this ${period}`);
    }

    // Encouragement-framed, never a guilt trip — no "missed X doses" or
    // day-pinpointed misses (medication_logs has no slot column to know
    // which day/dose precisely, same limitation as B5.3/B6).
    if (exercise.total_days > 0 && exercise.completed_days / exercise.total_days < 0.5) {
      areasNeedingSupport.push("Could use encouragement to keep up the exercise routine");
    }
    if (medicationAdherencePct !== null && medicationAdherencePct < 70) {
      areasNeedingSupport.push("Could use a nudge on medication doses");
    }
    if (chairTestTrend === "declining") {
      areasNeedingSupport.push("Chair test trending down — worth checking in");
    }
    if (consistencyPct < 30 && highlights.length === 0 && areasNeedingSupport.length === 0) {
      areasNeedingSupport.push(`Not much activity logged this ${period} — a call might help`);
    }
  }

  return {
    period,
    range: { from: fromStr, to: toStr },
    headline,
    consistency_pct: consistencyPct,
    exercise,
    medication_adherence_pct: medicationAdherencePct,
    chair_test_trend: chairTestTrend,
    highlights,
    areas_needing_support: areasNeedingSupport,
  };
}
