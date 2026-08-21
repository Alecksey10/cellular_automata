import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("test/","routes/apis/api_v0.1/example.tsx")
    , route("test_r/","routes/testRegister.tsx"),
    route("test_r2/","routes/auth/AuthPage.tsx"),
    route("search_by_tags/","routes/search/AutomataSearch.tsx"),
    route("automata/:automatonId","../client_apis/v0.2/gui/AutomatonView.tsx")
    

] satisfies RouteConfig;
 