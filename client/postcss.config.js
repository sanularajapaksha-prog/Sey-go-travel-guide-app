import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import tailwindConfig from "./tailwind.config.cjs";

export default {
  plugins: [tailwindcss(tailwindConfig), autoprefixer()],
};
