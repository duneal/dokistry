import postcssImport from "postcss-import";

const config = {
  plugins: [
    postcssImport(),
    "@tailwindcss/postcss",
  ],
};

export default config;
