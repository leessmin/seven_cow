import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
	return [
		{ title: "Ai" },
		{ name: "description", content: "7牛云校招项目" },
	];
}

export default function Home() {
	return <>
		<h1>hhhh</h1>
	</>;
}
