import { relations } from 'drizzle-orm/relations'
import {
  contestsContestmodel,
  contestsSolvemodel,
  contestsDisciplinemodel,
  contestsRoundsessionmodel,
  contestsScramblemodel,
  accountsUser,
  contestsTnoodlescramblesmodel,
  accountEmailaddress,
  accountEmailconfirmation,
  accountsSettingsmodel,
  authGroup,
  accountsUserGroups,
  djangoContentType,
  authPermission,
  accountsUserUserPermissions,
  authGroupPermissions,
  authtokenToken,
  contestsContestmodelDisciplineSet,
  contestsSingleresultleaderboardmodel,
  djangoAdminLog,
  socialaccountSocialaccount,
  djangoSite,
  socialaccountSocialappSites,
  socialaccountSocialapp,
  socialaccountSocialtoken,
} from './schema-legacy'

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
    accountsUser: one(accountsUser, {
      fields: [contestsSolvemodel.userId],
      references: [accountsUser.id],
    }),
    contestsSingleresultleaderboardmodels: many(
      contestsSingleresultleaderboardmodel,
    ),
  }),
)

export const contestsContestmodelRelations = relations(
  contestsContestmodel,
  ({ many }) => ({
    contestsSolvemodels: many(contestsSolvemodel),
    contestsContestmodelDisciplineSets: many(contestsContestmodelDisciplineSet),
    contestsRoundsessionmodels: many(contestsRoundsessionmodel),
    contestsScramblemodels: many(contestsScramblemodel),
  }),
)

export const contestsDisciplinemodelRelations = relations(
  contestsDisciplinemodel,
  ({ many }) => ({
    contestsSolvemodels: many(contestsSolvemodel),
    contestsTnoodlescramblesmodels: many(contestsTnoodlescramblesmodel),
    contestsContestmodelDisciplineSets: many(contestsContestmodelDisciplineSet),
    contestsRoundsessionmodels: many(contestsRoundsessionmodel),
    contestsScramblemodels: many(contestsScramblemodel),
  }),
)

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
    accountsUser: one(accountsUser, {
      fields: [contestsRoundsessionmodel.userId],
      references: [accountsUser.id],
    }),
  }),
)

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
)

export const accountsUserRelations = relations(accountsUser, ({ many }) => ({
  contestsSolvemodels: many(contestsSolvemodel),
  accountEmailaddresses: many(accountEmailaddress),
  accountsSettingsmodels: many(accountsSettingsmodel),
  accountsUserGroups: many(accountsUserGroups),
  accountsUserUserPermissions: many(accountsUserUserPermissions),
  authtokenTokens: many(authtokenToken),
  contestsRoundsessionmodels: many(contestsRoundsessionmodel),
  djangoAdminLogs: many(djangoAdminLog),
  socialaccountSocialaccounts: many(socialaccountSocialaccount),
}))

export const contestsTnoodlescramblesmodelRelations = relations(
  contestsTnoodlescramblesmodel,
  ({ one }) => ({
    contestsDisciplinemodel: one(contestsDisciplinemodel, {
      fields: [contestsTnoodlescramblesmodel.disciplineId],
      references: [contestsDisciplinemodel.id],
    }),
  }),
)

export const accountEmailaddressRelations = relations(
  accountEmailaddress,
  ({ one, many }) => ({
    accountsUser: one(accountsUser, {
      fields: [accountEmailaddress.userId],
      references: [accountsUser.id],
    }),
    accountEmailconfirmations: many(accountEmailconfirmation),
  }),
)

export const accountEmailconfirmationRelations = relations(
  accountEmailconfirmation,
  ({ one }) => ({
    accountEmailaddress: one(accountEmailaddress, {
      fields: [accountEmailconfirmation.emailAddressId],
      references: [accountEmailaddress.id],
    }),
  }),
)

export const accountsSettingsmodelRelations = relations(
  accountsSettingsmodel,
  ({ one }) => ({
    accountsUser: one(accountsUser, {
      fields: [accountsSettingsmodel.userId],
      references: [accountsUser.id],
    }),
  }),
)

export const accountsUserGroupsRelations = relations(
  accountsUserGroups,
  ({ one }) => ({
    authGroup: one(authGroup, {
      fields: [accountsUserGroups.groupId],
      references: [authGroup.id],
    }),
    accountsUser: one(accountsUser, {
      fields: [accountsUserGroups.userId],
      references: [accountsUser.id],
    }),
  }),
)

export const authGroupRelations = relations(authGroup, ({ many }) => ({
  accountsUserGroups: many(accountsUserGroups),
  authGroupPermissions: many(authGroupPermissions),
}))

export const authPermissionRelations = relations(
  authPermission,
  ({ one, many }) => ({
    djangoContentType: one(djangoContentType, {
      fields: [authPermission.contentTypeId],
      references: [djangoContentType.id],
    }),
    accountsUserUserPermissions: many(accountsUserUserPermissions),
    authGroupPermissions: many(authGroupPermissions),
  }),
)

export const djangoContentTypeRelations = relations(
  djangoContentType,
  ({ many }) => ({
    authPermissions: many(authPermission),
    djangoAdminLogs: many(djangoAdminLog),
  }),
)

export const accountsUserUserPermissionsRelations = relations(
  accountsUserUserPermissions,
  ({ one }) => ({
    authPermission: one(authPermission, {
      fields: [accountsUserUserPermissions.permissionId],
      references: [authPermission.id],
    }),
    accountsUser: one(accountsUser, {
      fields: [accountsUserUserPermissions.userId],
      references: [accountsUser.id],
    }),
  }),
)

export const authGroupPermissionsRelations = relations(
  authGroupPermissions,
  ({ one }) => ({
    authPermission: one(authPermission, {
      fields: [authGroupPermissions.permissionId],
      references: [authPermission.id],
    }),
    authGroup: one(authGroup, {
      fields: [authGroupPermissions.groupId],
      references: [authGroup.id],
    }),
  }),
)

export const authtokenTokenRelations = relations(authtokenToken, ({ one }) => ({
  accountsUser: one(accountsUser, {
    fields: [authtokenToken.userId],
    references: [accountsUser.id],
  }),
}))

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
)

export const contestsSingleresultleaderboardmodelRelations = relations(
  contestsSingleresultleaderboardmodel,
  ({ one }) => ({
    contestsSolvemodel: one(contestsSolvemodel, {
      fields: [contestsSingleresultleaderboardmodel.solveId],
      references: [contestsSolvemodel.id],
    }),
  }),
)

export const djangoAdminLogRelations = relations(djangoAdminLog, ({ one }) => ({
  djangoContentType: one(djangoContentType, {
    fields: [djangoAdminLog.contentTypeId],
    references: [djangoContentType.id],
  }),
  accountsUser: one(accountsUser, {
    fields: [djangoAdminLog.userId],
    references: [accountsUser.id],
  }),
}))

export const socialaccountSocialaccountRelations = relations(
  socialaccountSocialaccount,
  ({ one, many }) => ({
    accountsUser: one(accountsUser, {
      fields: [socialaccountSocialaccount.userId],
      references: [accountsUser.id],
    }),
    socialaccountSocialtokens: many(socialaccountSocialtoken),
  }),
)

export const socialaccountSocialappSitesRelations = relations(
  socialaccountSocialappSites,
  ({ one }) => ({
    djangoSite: one(djangoSite, {
      fields: [socialaccountSocialappSites.siteId],
      references: [djangoSite.id],
    }),
    socialaccountSocialapp: one(socialaccountSocialapp, {
      fields: [socialaccountSocialappSites.socialappId],
      references: [socialaccountSocialapp.id],
    }),
  }),
)

export const djangoSiteRelations = relations(djangoSite, ({ many }) => ({
  socialaccountSocialappSites: many(socialaccountSocialappSites),
}))

export const socialaccountSocialappRelations = relations(
  socialaccountSocialapp,
  ({ many }) => ({
    socialaccountSocialappSites: many(socialaccountSocialappSites),
    socialaccountSocialtokens: many(socialaccountSocialtoken),
  }),
)

export const socialaccountSocialtokenRelations = relations(
  socialaccountSocialtoken,
  ({ one }) => ({
    socialaccountSocialaccount: one(socialaccountSocialaccount, {
      fields: [socialaccountSocialtoken.accountId],
      references: [socialaccountSocialaccount.id],
    }),
    socialaccountSocialapp: one(socialaccountSocialapp, {
      fields: [socialaccountSocialtoken.appId],
      references: [socialaccountSocialapp.id],
    }),
  }),
)
