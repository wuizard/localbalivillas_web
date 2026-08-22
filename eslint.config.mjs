import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const featureBoundaries = [
  {
    // A feature is consumed only through its barrel.
    group: ["@/features/*/*"],
    message: "Import a feature through its barrel: @/features/<name>.",
  },
  {
    group: ["@/app", "@/app/*"],
    message: "Nothing may import from app/ — routes are leaves.",
  },
];

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-imports": ["error", { patterns: featureBoundaries }],
    },
  },

  {
    // shared/ is the floor of the dependency graph.
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...featureBoundaries,
            { group: ["@/features/*"], message: "shared/ must never import from features/." },
            { group: ["@/components/*"], message: "shared/ must never import from components/." },
          ],
        },
      ],
    },
  },

  {
    // Cross-feature imports are a design smell — lift the code into shared/.
    // `features/pricing` is the one exception CLAUDE.md §3 carves out: it is pure, has no
    // I/O, and is the single code path every surface must use to touch money.
    files: ["src/features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...featureBoundaries,
            {
              group: ["@/features/*", "!@/features/pricing"],
              message:
                "Features must not import other features. Move the shared code to shared/ or features/pricing.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
