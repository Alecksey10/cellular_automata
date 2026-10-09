// import type { AutomatonSearchRequest } from "./types";

// export function requestAutomatonSearchToUri(request: AutomatonSearchRequest)
// {
//     const params = new URLSearchParams();

//     if (request.text) {
//         params.set(
//             "text",
//             request.text,
//         );
//     }

//     for (const tag of request.tags ?? []) {
//         params.append(
//             "tags",
//             tag,
//         );
//     }

//     for (const collection of request.collections ?? []) {
//         params.append(
//             "collections",
//             collection,
//         );
//     }

//     if (request.owner) {
//         params.set(
//             "owner",
//             request.owner,
//         );
//     }

//     if (request.sort) {
//         params.set(
//             "sort",
//             request.sort,
//         );
//     }

//     if (request.page !== undefined) {
//         params.set(
//             "page",
//             request.page.toString(),
//         );
//     }

//     return `${params.toString()}`;
// }

