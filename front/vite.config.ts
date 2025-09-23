import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	server: {
		proxy: {
			"/api": "http://100.93.208.87:8080",
			"/upload": "http://100.93.208.87:8080",
			"/assert": "http://100.93.208.87:8080"
		}
	}
});
