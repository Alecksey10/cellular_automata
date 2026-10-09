import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  route("test/", "routes/apis/api_v0.1/example.tsx"),

  layout("routes/app-layout.tsx", [
    route("test_r2/", "routes/auth/AuthPage.tsx"),
    route("search_by_tags/", "routes/search/AutomataSearch.tsx"),
    route("automata/:automatonId", "../client_apis/v0.2.1/gui/AutomatonView.tsx"),
    route("update_automata/:automatonId", "routes/automata/UpdateAutomataPage.tsx"),
    route("create_automata/", "routes/automata/CreateAutomataPage.tsx"),
  ]),
] satisfies RouteConfig;
