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
  uniqueIndex,
  check,
  smallint,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contestsSolvemodel = pgTable(
  "contests_solvemodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_solvemodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
      foreignColumns: [accountsUser.id],
      name: "contests_solvemodel_user_id_28200dba_fk_accounts_user_id",
    }),
  ],
);

export const contestsTnoodlescramblesmodel = pgTable(
  "contests_tnoodlescramblesmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_tnoodlescramblesmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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

export const accountsUser = pgTable(
  "accounts_user",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "accounts_user_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    password: varchar({ length: 128 }).notNull(),
    lastLogin: timestamp("last_login", { withTimezone: true, mode: "string" }),
    isSuperuser: boolean("is_superuser").notNull(),
    username: varchar({ length: 20 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    isVerified: boolean("is_verified").notNull(),
    isActive: boolean("is_active").notNull(),
    isStaff: boolean("is_staff").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("accounts_user_email_b2644a56_like").using(
      "btree",
      table.email.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    index("accounts_user_username_6088629e_like").using(
      "btree",
      table.username.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    unique("accounts_user_username_key").on(table.username),
    unique("accounts_user_email_key").on(table.email),
  ],
);

export const accountEmailaddress = pgTable(
  "account_emailaddress",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "account_emailaddress_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    email: varchar({ length: 254 }).notNull(),
    verified: boolean().notNull(),
    primary: boolean().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("account_emailaddress_upper").using(
      "btree",
      sql`upper((email)::text)`,
    ),
    index("account_emailaddress_user_id_2c513194").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    uniqueIndex("unique_verified_email")
      .using("btree", table.email.asc().nullsLast().op("text_ops"))
      .where(sql`verified`),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [accountsUser.id],
      name: "account_emailaddress_user_id_2c513194_fk_accounts_user_id",
    }),
    unique("account_emailaddress_user_id_email_987c8728_uniq").on(
      table.email,
      table.userId,
    ),
  ],
);

export const accountEmailconfirmation = pgTable(
  "account_emailconfirmation",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "account_emailconfirmation_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    created: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    sent: timestamp({ withTimezone: true, mode: "string" }),
    key: varchar({ length: 64 }).notNull(),
    emailAddressId: integer("email_address_id").notNull(),
  },
  (table) => [
    index("account_emailconfirmation_email_address_id_5b7f8c58").using(
      "btree",
      table.emailAddressId.asc().nullsLast().op("int4_ops"),
    ),
    index("account_emailconfirmation_key_f43612bd_like").using(
      "btree",
      table.key.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    foreignKey({
      columns: [table.emailAddressId],
      foreignColumns: [accountEmailaddress.id],
      name: "account_emailconfirm_email_address_id_5b7f8c58_fk_account_e",
    }),
    unique("account_emailconfirmation_key_key").on(table.key),
  ],
);

export const accountsSettingsmodel = pgTable(
  "accounts_settingsmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "accounts_settingsmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
      foreignColumns: [accountsUser.id],
      name: "accounts_settingsmodel_user_id_b5b21c0f_fk_accounts_user_id",
    }),
    unique("accounts_settingsmodel_user_id_key").on(table.userId),
  ],
);

export const authGroup = pgTable(
  "auth_group",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "auth_group_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    name: varchar({ length: 150 }).notNull(),
  },
  (table) => [
    index("auth_group_name_a6ea08ec_like").using(
      "btree",
      table.name.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    unique("auth_group_name_key").on(table.name),
  ],
);

export const accountsUserGroups = pgTable(
  "accounts_user_groups",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "accounts_user_groups_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
    groupId: integer("group_id").notNull(),
  },
  (table) => [
    index("accounts_user_groups_group_id_bd11a704").using(
      "btree",
      table.groupId.asc().nullsLast().op("int4_ops"),
    ),
    index("accounts_user_groups_user_id_52b62117").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [authGroup.id],
      name: "accounts_user_groups_group_id_bd11a704_fk_auth_group_id",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [accountsUser.id],
      name: "accounts_user_groups_user_id_52b62117_fk_accounts_user_id",
    }),
    unique("accounts_user_groups_user_id_group_id_59c0b32f_uniq").on(
      table.userId,
      table.groupId,
    ),
  ],
);

export const authPermission = pgTable(
  "auth_permission",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "auth_permission_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    name: varchar({ length: 255 }).notNull(),
    contentTypeId: integer("content_type_id").notNull(),
    codename: varchar({ length: 100 }).notNull(),
  },
  (table) => [
    index("auth_permission_content_type_id_2f476e4b").using(
      "btree",
      table.contentTypeId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.contentTypeId],
      foreignColumns: [djangoContentType.id],
      name: "auth_permission_content_type_id_2f476e4b_fk_django_co",
    }),
    unique("auth_permission_content_type_id_codename_01ab375a_uniq").on(
      table.contentTypeId,
      table.codename,
    ),
  ],
);

export const accountsUserUserPermissions = pgTable(
  "accounts_user_user_permissions",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "accounts_user_user_permissions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
    permissionId: integer("permission_id").notNull(),
  },
  (table) => [
    index("accounts_user_user_permissions_permission_id_113bb443").using(
      "btree",
      table.permissionId.asc().nullsLast().op("int4_ops"),
    ),
    index("accounts_user_user_permissions_user_id_e4f0a161").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [authPermission.id],
      name: "accounts_user_user_p_permission_id_113bb443_fk_auth_perm",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [accountsUser.id],
      name: "accounts_user_user_p_user_id_e4f0a161_fk_accounts_",
    }),
    unique("accounts_user_user_permi_user_id_permission_id_2ab516c2_uniq").on(
      table.userId,
      table.permissionId,
    ),
  ],
);

export const authGroupPermissions = pgTable(
  "auth_group_permissions",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "auth_group_permissions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    groupId: integer("group_id").notNull(),
    permissionId: integer("permission_id").notNull(),
  },
  (table) => [
    index("auth_group_permissions_group_id_b120cbf9").using(
      "btree",
      table.groupId.asc().nullsLast().op("int4_ops"),
    ),
    index("auth_group_permissions_permission_id_84c5c92e").using(
      "btree",
      table.permissionId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [authPermission.id],
      name: "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm",
    }),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [authGroup.id],
      name: "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id",
    }),
    unique("auth_group_permissions_group_id_permission_id_0cd325b0_uniq").on(
      table.groupId,
      table.permissionId,
    ),
  ],
);

export const authtokenToken = pgTable(
  "authtoken_token",
  {
    key: varchar({ length: 40 }).primaryKey().notNull(),
    created: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("authtoken_token_key_10f0b77e_like").using(
      "btree",
      table.key.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [accountsUser.id],
      name: "authtoken_token_user_id_35299eff_fk_accounts_user_id",
    }),
    unique("authtoken_token_user_id_key").on(table.userId),
  ],
);

export const contestsContestmodel = pgTable(
  "contests_contestmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_contestmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
  "contests_contestmodel_discipline_set",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_contestmodel_discipline_set_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
  "contests_disciplinemodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_disciplinemodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
  "contests_roundsessionmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_roundsessionmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
      foreignColumns: [accountsUser.id],
      name: "contests_roundsessionmodel_user_id_3b33a5a3_fk_accounts_user_id",
    }),
  ],
);

export const contestsScramblemodel = pgTable(
  "contests_scramblemodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_scramblemodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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
  "contests_singleresultleaderboardmodel",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "contests_singleresultleaderboardmodel_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
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

export const djangoMigrations = pgTable("django_migrations", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "django_migrations_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  app: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  applied: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});

export const djangoSession = pgTable(
  "django_session",
  {
    sessionKey: varchar("session_key", { length: 40 }).primaryKey().notNull(),
    sessionData: text("session_data").notNull(),
    expireDate: timestamp("expire_date", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    index("django_session_expire_date_a5c62663").using(
      "btree",
      table.expireDate.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("django_session_session_key_c0390e0f_like").using(
      "btree",
      table.sessionKey.asc().nullsLast().op("varchar_pattern_ops"),
    ),
  ],
);

export const djangoSite = pgTable(
  "django_site",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "django_site_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    domain: varchar({ length: 100 }).notNull(),
    name: varchar({ length: 50 }).notNull(),
  },
  (table) => [
    index("django_site_domain_a2e37b91_like").using(
      "btree",
      table.domain.asc().nullsLast().op("varchar_pattern_ops"),
    ),
    unique("django_site_domain_a2e37b91_uniq").on(table.domain),
  ],
);

export const djangoAdminLog = pgTable(
  "django_admin_log",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "django_admin_log_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    actionTime: timestamp("action_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    objectId: text("object_id"),
    objectRepr: varchar("object_repr", { length: 200 }).notNull(),
    actionFlag: smallint("action_flag").notNull(),
    changeMessage: text("change_message").notNull(),
    contentTypeId: integer("content_type_id"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("django_admin_log_content_type_id_c4bce8eb").using(
      "btree",
      table.contentTypeId.asc().nullsLast().op("int4_ops"),
    ),
    index("django_admin_log_user_id_c564eba6").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.contentTypeId],
      foreignColumns: [djangoContentType.id],
      name: "django_admin_log_content_type_id_c4bce8eb_fk_django_co",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [accountsUser.id],
      name: "django_admin_log_user_id_c564eba6_fk_accounts_user_id",
    }),
    check("django_admin_log_action_flag_check", sql`action_flag >= 0`),
  ],
);

export const socialaccountSocialaccount = pgTable(
  "socialaccount_socialaccount",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "socialaccount_socialaccount_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    provider: varchar({ length: 200 }).notNull(),
    uid: varchar({ length: 191 }).notNull(),
    lastLogin: timestamp("last_login", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    dateJoined: timestamp("date_joined", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    extraData: text("extra_data").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }).notNull(),
  },
  (table) => [
    index("socialaccount_socialaccount_user_id_8146e70c").using(
      "btree",
      table.userId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [accountsUser.id],
      name: "socialaccount_social_user_id_8146e70c_fk_accounts_",
    }),
    unique("socialaccount_socialaccount_provider_uid_fc810c6e_uniq").on(
      table.provider,
      table.uid,
    ),
  ],
);

export const socialaccountSocialappSites = pgTable(
  "socialaccount_socialapp_sites",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "socialaccount_socialapp_sites_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    socialappId: integer("socialapp_id").notNull(),
    siteId: integer("site_id").notNull(),
  },
  (table) => [
    index("socialaccount_socialapp_sites_site_id_2579dee5").using(
      "btree",
      table.siteId.asc().nullsLast().op("int4_ops"),
    ),
    index("socialaccount_socialapp_sites_socialapp_id_97fb6e7d").using(
      "btree",
      table.socialappId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.siteId],
      foreignColumns: [djangoSite.id],
      name: "socialaccount_social_site_id_2579dee5_fk_django_si",
    }),
    foreignKey({
      columns: [table.socialappId],
      foreignColumns: [socialaccountSocialapp.id],
      name: "socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc",
    }),
    unique("socialaccount_socialapp__socialapp_id_site_id_71a9a768_uniq").on(
      table.socialappId,
      table.siteId,
    ),
  ],
);

export const djangoContentType = pgTable(
  "django_content_type",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "django_content_type_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    appLabel: varchar("app_label", { length: 100 }).notNull(),
    model: varchar({ length: 100 }).notNull(),
  },
  (table) => [
    unique("django_content_type_app_label_model_76bd3d3b_uniq").on(
      table.appLabel,
      table.model,
    ),
  ],
);

export const socialaccountSocialtoken = pgTable(
  "socialaccount_socialtoken",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "socialaccount_socialtoken_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    token: text().notNull(),
    tokenSecret: text("token_secret").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    accountId: integer("account_id").notNull(),
    appId: integer("app_id"),
  },
  (table) => [
    index("socialaccount_socialtoken_account_id_951f210e").using(
      "btree",
      table.accountId.asc().nullsLast().op("int4_ops"),
    ),
    index("socialaccount_socialtoken_app_id_636a42d7").using(
      "btree",
      table.appId.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [socialaccountSocialaccount.id],
      name: "socialaccount_social_account_id_951f210e_fk_socialacc",
    }),
    foreignKey({
      columns: [table.appId],
      foreignColumns: [socialaccountSocialapp.id],
      name: "socialaccount_social_app_id_636a42d7_fk_socialacc",
    }),
    unique("socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq").on(
      table.accountId,
      table.appId,
    ),
  ],
);

export const socialaccountSocialapp = pgTable("socialaccount_socialapp", {
  id: integer().primaryKey().generatedByDefaultAsIdentity({
    name: "socialaccount_socialapp_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  provider: varchar({ length: 30 }).notNull(),
  name: varchar({ length: 40 }).notNull(),
  clientId: varchar("client_id", { length: 191 }).notNull(),
  secret: varchar({ length: 191 }).notNull(),
  key: varchar({ length: 191 }).notNull(),
  providerId: varchar("provider_id", { length: 200 }).notNull(),
  settings: jsonb().notNull(),
});
