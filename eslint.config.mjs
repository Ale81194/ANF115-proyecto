import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const mensajeCapa = (capa, prohibido) =>
  `Layer violation: ${capa} must not import ${prohibido}. See AGENTS.md section 5.`;

const capas = [
  {
    name: "components",
    files: ["src/components/**/*.{ts,tsx}"],
    patterns: [
      "@/repositorios/*",
      "@/supabase/*",
      "@/servicios/*",
      "@/controladores/*",
      "@/auth/*",
    ],
  },
  {
    name: "servicios",
    files: ["src/servicios/**/*.{ts,tsx}"],
    patterns: [
      "next/*",
      "react",
      "react-dom",
      "@supabase/*",
      "@/repositorios/*",
      "@/supabase/*",
      "@/components/*",
    ],
  },
  {
    name: "controladores",
    files: ["src/controladores/**/*.{ts,tsx}"],
    patterns: ["next/*", "react", "react-dom", "@/components/*", "@/app/*"],
  },
  {
    name: "repositorios",
    files: ["src/repositorios/**/*.{ts,tsx}"],
    patterns: ["next/*", "react", "react-dom", "@/components/*", "@/servicios/*"],
  },
  {
    name: "app",
    files: ["src/app/**/*.{ts,tsx}"],
    patterns: ["@/repositorios/*", "@/supabase/*"],
  },
  {
    name: "lib",
    files: ["src/lib/**/*.{ts,tsx}"],
    patterns: [
      "next/*",
      "react",
      "react-dom",
      "@supabase/*",
      "@/components/*",
      "@/controladores/*",
      "@/repositorios/*",
    ],
  },
  {
    name: "supabase",
    files: ["src/supabase/**/*.{ts,tsx}"],
    patterns: ["@/components/*", "@/controladores/*", "@/servicios/*"],
  },
  {
    name: "auth",
    files: ["src/auth/**/*.{ts,tsx}"],
    patterns: ["@/components/*", "@/app/*"],
  },
];

const reglasDeCapa = capas.map((capa) => ({
  files: capa.files,
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: capa.patterns.map((patron) => ({
          group: [patron],
          message: mensajeCapa(capa.name, patron),
        })),
      },
    ],
  },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...reglasDeCapa,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "supabase/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
