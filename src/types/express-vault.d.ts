// import "express-serve-static-core";
// import type { Responder, SendOptions, ListOptions } from "../utils/responder";

// declare module "express-serve-static-core" {
// 	interface Response {
// 		vault: {
// 			envelope: Responder["envelope"];
// 			ok: <T, M extends object = {}>(data: T, opts?: SendOptions<M>) => this;
// 			created: <T, M extends object = {}>(data: T, opts?: SendOptions<M>) => this;
// 			accepted: <T, M extends object = {}>(data: T, opts?: SendOptions<M>) => this;
// 			noContent: (opts?: Omit<SendOptions, "meta" | "links" | "extend">) => this;
// 			list: <T, M extends object = {}>(items: T[], opts: ListOptions<T, M>) => this;
// 		};
// 	}
// }
