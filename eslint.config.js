import tseslint from 'typescript-eslint'
// @ts-expect-error -- no types for this plugin
import drizzle from 'eslint-plugin-drizzle'
import nextVitals from 'eslint-config-next/core-web-vitals'

// eslint-config-next bundles its own typescript-eslint instance which conflicts
// with our direct import. Remove the duplicate @typescript-eslint plugin entries.
const nextVitalsPatched = nextVitals.map((config) => {
  if (config.plugins?.['@typescript-eslint']) {
    const plugins = Object.fromEntries(
      Object.entries(config.plugins).filter(
        ([k]) => k !== '@typescript-eslint',
      ),
    )
    return { ...config, plugins }
  }
  return config
})

export default tseslint.config(
  {
    ignores: [
      // Default ignores of eslint-config-next:
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'vendor/**',
      '.claude/**',
    ],
  },
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...nextVitalsPatched,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      drizzle,
    },
    rules: {
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      'drizzle/enforce-delete-with-where': [
        'error',
        { drizzleObjectName: ['db', 'ctx.db'] },
      ],
      'drizzle/enforce-update-with-where': [
        'error',
        { drizzleObjectName: ['db', 'ctx.db'] },
      ],
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off', // this is probably not ideal, but w/e
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },
)
