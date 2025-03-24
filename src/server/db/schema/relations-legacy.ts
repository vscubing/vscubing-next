import { relations } from "drizzle-orm/relations";
import {
  contestsContestmodel,
  contestsSolvemodel,
  contestsDisciplinemodel,
  contestsRoundsessionmodel,
  contestsScramblemodel,
  users,
  contestsTnoodlescramblesmodel,
  accountsSettingsmodel,
  contestsContestmodelDisciplineSet,
  contestsSingleresultleaderboardmodel,
} from "./schema-legacy";

export const contestsSolvemodelRelations = relations(
  contestsSolvemodel,
  ({ one, many }) => ({
    contestsContestmodel: one(contestsContestmodel, {
      fields: [contestsSolvemodel.contestId],
      references: [contestsContestmodel.id],
    }),
    contestsDisciplinemodel: one(contestsDisciplinemodel, {
      fields: [contestsSolvemodel.disciplineId],
      references: [contestsDisciplinemodel.id],
    }),
    contestsRoundsessionmodel: one(contestsRoundsessionmodel, {
      fields: [contestsSolvemodel.roundSessionId],
      references: [contestsRoundsessionmodel.id],
    }),
    contestsScramblemodel: one(contestsScramblemodel, {
      fields: [contestsSolvemodel.scrambleId],
      references: [contestsScramblemodel.id],
    }),
    accountsUser: one(users, {
      fields: [contestsSolvemodel.userId],
      references: [users.id],
    }),
    contestsSingleresultleaderboardmodels: many(
      contestsSingleresultleaderboardmodel,
    ),
  }),
);

export const contestsContestmodelRelations = relations(
  contestsContestmodel,
  ({ many }) => ({
    contestsSolvemodels: many(contestsSolvemodel),
    contestsContestmodelDisciplineSets: many(contestsContestmodelDisciplineSet),
    contestsRoundsessionmodels: many(contestsRoundsessionmodel),
    contestsScramblemodels: many(contestsScramblemodel),
  }),
);

export const contestsDisciplinemodelRelations = relations(
  contestsDisciplinemodel,
  ({ many }) => ({
    contestsSolvemodels: many(contestsSolvemodel),
    contestsTnoodlescramblesmodels: many(contestsTnoodlescramblesmodel),
    contestsContestmodelDisciplineSets: many(contestsContestmodelDisciplineSet),
    contestsRoundsessionmodels: many(contestsRoundsessionmodel),
    contestsScramblemodels: many(contestsScramblemodel),
  }),
);

export const contestsRoundsessionmodelRelations = relations(
  contestsRoundsessionmodel,
  ({ one, many }) => ({
    contestsSolvemodels: many(contestsSolvemodel),
    contestsContestmodel: one(contestsContestmodel, {
      fields: [contestsRoundsessionmodel.contestId],
      references: [contestsContestmodel.id],
    }),
    contestsDisciplinemodel: one(contestsDisciplinemodel, {
      fields: [contestsRoundsessionmodel.disciplineId],
      references: [contestsDisciplinemodel.id],
    }),
    accountsUser: one(users, {
      fields: [contestsRoundsessionmodel.userId],
      references: [users.id],
    }),
  }),
);

export const contestsScramblemodelRelations = relations(
  contestsScramblemodel,
  ({ one, many }) => ({
    contestsSolvemodels: many(contestsSolvemodel),
    contestsContestmodel: one(contestsContestmodel, {
      fields: [contestsScramblemodel.contestId],
      references: [contestsContestmodel.id],
    }),
    contestsDisciplinemodel: one(contestsDisciplinemodel, {
      fields: [contestsScramblemodel.disciplineId],
      references: [contestsDisciplinemodel.id],
    }),
  }),
);

export const accountsUserRelations = relations(users, ({ many }) => ({
  contestsSolvemodels: many(contestsSolvemodel),
  accountsSettingsmodels: many(accountsSettingsmodel),
  contestsRoundsessionmodels: many(contestsRoundsessionmodel),
}));

export const contestsTnoodlescramblesmodelRelations = relations(
  contestsTnoodlescramblesmodel,
  ({ one }) => ({
    contestsDisciplinemodel: one(contestsDisciplinemodel, {
      fields: [contestsTnoodlescramblesmodel.disciplineId],
      references: [contestsDisciplinemodel.id],
    }),
  }),
);

export const accountsSettingsmodelRelations = relations(
  accountsSettingsmodel,
  ({ one }) => ({
    accountsUser: one(users, {
      fields: [accountsSettingsmodel.userId],
      references: [users.id],
    }),
  }),
);

export const contestsContestmodelDisciplineSetRelations = relations(
  contestsContestmodelDisciplineSet,
  ({ one }) => ({
    contestsContestmodel: one(contestsContestmodel, {
      fields: [contestsContestmodelDisciplineSet.contestmodelId],
      references: [contestsContestmodel.id],
    }),
    contestsDisciplinemodel: one(contestsDisciplinemodel, {
      fields: [contestsContestmodelDisciplineSet.disciplinemodelId],
      references: [contestsDisciplinemodel.id],
    }),
  }),
);

export const contestsSingleresultleaderboardmodelRelations = relations(
  contestsSingleresultleaderboardmodel,
  ({ one }) => ({
    contestsSolvemodel: one(contestsSolvemodel, {
      fields: [contestsSingleresultleaderboardmodel.solveId],
      references: [contestsSolvemodel.id],
    }),
  }),
);
