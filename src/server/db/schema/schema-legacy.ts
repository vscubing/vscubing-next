import {
  pgTable,
  index,
  foreignKey,
  bigint,
  timestamp,
  integer,
  boolean,
  varchar,
  text,
  unique,
} from "drizzle-orm/pg-core";

export const contestsSolvemodel = pgTable(
  "legacy_contests_solvemodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_solvemodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    timeMs: integer("time_ms"),
    isDnf: boolean("is_dnf").notNull(),
    extraId: integer("extra_id"),
    submissionState: varchar("submission_state", { length: 96 }).notNull(),
    reconstruction: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    contestId: bigint("contest_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    disciplineId: bigint("discipline_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    roundSessionId: bigint("round_session_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    scrambleId: bigint("scramble_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("contests_solvemodel_contest_id_98f20926").using(
      "btree",
      table.contestId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_solvemodel_created_at_57193ba0").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("contests_solvemodel_discipline_id_cb3f8e9b").using(
      "btree",
      table.disciplineId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_solvemodel_round_session_id_abf6ee3b").using(
      "btree",
      table.roundSessionId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_solvemodel_scramble_id_b21e23aa").using(
      "btree",
      table.scrambleId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_solvemodel_user_id_28200dba").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.contestId],
      foreignColumns: [contestsContestmodel.id],
      name: "contests_solvemodel_contest_id_98f20926_fk_contests_",
    }),
    foreignKey({
      columns: [table.disciplineId],
      foreignColumns: [contestsDisciplinemodel.id],
      name: "contests_solvemodel_discipline_id_cb3f8e9b_fk_contests_",
    }),
    foreignKey({
      columns: [table.roundSessionId],
      foreignColumns: [contestsRoundsessionmodel.id],
      name: "contests_solvemodel_round_session_id_abf6ee3b_fk_contests_",
    }),
    foreignKey({
      columns: [table.scrambleId],
      foreignColumns: [contestsScramblemodel.id],
      name: "contests_solvemodel_scramble_id_b21e23aa_fk_contests_",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "contests_solvemodel_user_id_28200dba_fk_accounts_user_id",
    }),
  ],
);

export const contestsTnoodlescramblesmodel = pgTable(
  "legacy_contests_tnoodlescramblesmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_tnoodlescramblesmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    moves: varchar({ length: 150 }).notNull(),
    isUsed: boolean("is_used").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    disciplineId: bigint("discipline_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("contests_tnoodlescramblesmodel_created_at_6655c02d").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("contests_tnoodlescramblesmodel_discipline_id_200a6a3a").using(
      "btree",
      table.disciplineId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_tnoodlescramblesmodel_moves_35d3f5a9_like").using(
      "btree",
      table.moves.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    foreignKey({
      columns: [table.disciplineId],
      foreignColumns: [contestsDisciplinemodel.id],
      name: "contests_tnoodlescra_discipline_id_200a6a3a_fk_contests_",
    }),
    unique("contests_tnoodlescramblesmodel_moves_key").on(table.moves),
  ],
);

export const users = pgTable(
  "user",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "accounts_user_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    name: varchar({ length: 20 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    isVerified: boolean("is_verified").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("accounts_user_email_b2644a56_like").using(
      "btree",
      table.email.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    // index("accounts_user_username_6088629e_like").using(
    //   "btree",
    //   table.username.asc().nullsLast().op("varchar_pattern_ops"),
    // ),
    unique("accounts_user_name_key").on(table.name),
    unique("accounts_user_email_key").on(table.email),
  ],
);

export const accountsSettingsmodel = pgTable(
  "legacy_accounts_settingsmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "accounts_settingsmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    cstimerInspectionVoiceAlert: varchar("cstimer_inspection_voice_alert", {
      length: 10,
    }).notNull(),
    cstimerAnimationDuration: integer("cstimer_animation_duration").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("accounts_settingsmodel_created_at_4e1ba83b").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id",
    }),
    unique("accounts_settingsmodel_user_id_key").on(table.userId),
  ],
);

export const contestsContestmodel = pgTable(
  "legacy_contests_contestmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_contestmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    name: varchar({ length: 128 }).notNull(),
    slug: varchar({ length: 128 }).notNull(),
    startDate: timestamp("start_date", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true, mode: "string" }),
    isOngoing: boolean("is_ongoing").notNull(),
  },
  (table) => [
    index("contests_contestmodel_created_at_fa7b00bb").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("contests_contestmodel_name_b8960dcf_like").using(
      "btree",
      table.name.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    index("contests_contestmodel_slug_dc960f39_like").using(
      "btree",
      table.slug.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    unique("contests_contestmodel_name_key").on(table.name),
    unique("contests_contestmodel_slug_key").on(table.slug),
  ],
);

export const contestsContestmodelDisciplineSet = pgTable(
  "legacy_contests_contestmodel_discipline_set",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_contestmodel_discipline_set_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    contestmodelId: bigint("contestmodel_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    disciplinemodelId: bigint("disciplinemodel_id", {
      mode: "number",
    }).notNull(),
  },
  (table) => [
    index("contests_contestmodel_disc_disciplinemodel_id_bb9f5499").using(
      "btree",
      table.disciplinemodelId.asc().nullsLast().op("int8_ops"),
    ),
    index(
      "contests_contestmodel_discipline_set_contestmodel_id_9830ff33",
    ).using("btree", table.contestmodelId.asc().nullsLast().op("int8_ops")),
    foreignKey({
      columns: [table.contestmodelId],
      foreignColumns: [contestsContestmodel.id],
      name: "contests_contestmode_contestmodel_id_9830ff33_fk_contests_",
    }),
    foreignKey({
      columns: [table.disciplinemodelId],
      foreignColumns: [contestsDisciplinemodel.id],
      name: "contests_contestmode_disciplinemodel_id_bb9f5499_fk_contests_",
    }),
    unique(
      "contests_contestmodel_di_contestmodel_id_discipli_e92e6323_uniq",
    ).on(table.contestmodelId, table.disciplinemodelId),
  ],
);

export const contestsDisciplinemodel = pgTable(
  "legacy_contests_disciplinemodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_disciplinemodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    name: varchar({ length: 128 }).notNull(),
    slug: varchar({ length: 128 }).notNull(),
  },
  (table) => [
    index("contests_disciplinemodel_created_at_df13f068").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("contests_disciplinemodel_name_dd3cb06b_like").using(
      "btree",
      table.name.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    index("contests_disciplinemodel_slug_4a7f3518_like").using(
      "btree",
      table.slug.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    unique("contests_disciplinemodel_name_key").on(table.name),
    unique("contests_disciplinemodel_slug_key").on(table.slug),
  ],
);

export const contestsRoundsessionmodel = pgTable(
  "legacy_contests_roundsessionmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_roundsessionmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    avgMs: integer("avg_ms"),
    isDnf: boolean("is_dnf").notNull(),
    isFinished: boolean("is_finished").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    contestId: bigint("contest_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    disciplineId: bigint("discipline_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("contests_roundsessionmodel_contest_id_e6fa066d").using(
      "btree",
      table.contestId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_roundsessionmodel_created_at_07fea56f").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("contests_roundsessionmodel_discipline_id_0f555c24").using(
      "btree",
      table.disciplineId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_roundsessionmodel_user_id_3b33a5a3").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.contestId],
      foreignColumns: [contestsContestmodel.id],
      name: "contests_roundsessio_contest_id_e6fa066d_fk_contests_",
    }),
    foreignKey({
      columns: [table.disciplineId],
      foreignColumns: [contestsDisciplinemodel.id],
      name: "contests_roundsessio_discipline_id_0f555c24_fk_contests_",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id",
    }),
  ],
);

export const contestsScramblemodel = pgTable(
  "legacy_contests_scramblemodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_scramblemodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    position: varchar({ length: 10 }).notNull(),
    moves: text().notNull(),
    isExtra: boolean("is_extra").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    contestId: bigint("contest_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    disciplineId: bigint("discipline_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("contests_scramblemodel_contest_id_d67db4b5").using(
      "btree",
      table.contestId.asc().nullsLast().op("int8_ops"),
    ),
    index("contests_scramblemodel_created_at_4546f9f0").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("contests_scramblemodel_discipline_id_7e00f2e1").using(
      "btree",
      table.disciplineId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.contestId],
      foreignColumns: [contestsContestmodel.id],
      name: "contests_scramblemod_contest_id_d67db4b5_fk_contests_",
    }),
    foreignKey({
      columns: [table.disciplineId],
      foreignColumns: [contestsDisciplinemodel.id],
      name: "contests_scramblemod_discipline_id_7e00f2e1_fk_contests_",
    }),
  ],
);

export const contestsSingleresultleaderboardmodel = pgTable(
  "legacy_contests_singleresultleaderboardmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_singleresultleaderboardmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      cache: 1,
    }),
    timeMs: integer("time_ms").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    solveId: bigint("solve_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("contests_singleresultleaderboardmodel_time_ms_819a540a").using(
      "btree",
      table.timeMs.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.solveId],
      foreignColumns: [contestsSolvemodel.id],
      name: "contests_singleresul_solve_id_e45376e5_fk_contests_",
    }),
    unique("contests_singleresultleaderboardmodel_solve_id_key").on(
      table.solveId,
    ),
  ],
);
