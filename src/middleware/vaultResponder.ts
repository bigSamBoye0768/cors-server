// import type { NextFunction, Request, Response } from "express";
// import { responder, Responder, SendOptions, ListOptions } from "../utils/responder";

// type VaultResponder = {
// 	envelope: Responder["envelope"];
// 	ok: <T, M extends object = {}>(data: T, opts?: SendOptions<M>) => Response;
// 	created: <T, M extends object = {}>(data: T, opts?: SendOptions<M>) => Response;
// 	accepted: <T, M extends object = {}>(data: T, opts?: SendOptions<M>) => Response;
// 	noContent: (opts?: Omit<SendOptions, "meta" | "links" | "extend">) => Response;
// 	list: <T, M extends object = {}>(items: T[], opts: ListOptions<T, M>) => Response;
// };

// declare module "express-serve-static-core" {
// 	// add `vault` to Response
// 	interface Response {
// 		vault: VaultResponder;
// 	}
// }

// /** Attach `res.vault.*` helpers. Pass optional base meta for every response. */
// export function vaultResponder(baseMeta?: Record<string, unknown>) {
// 	return (req: Request, res: Response, next: NextFunction) => {
// 		const r = responder(req, res, baseMeta);

// 		res.vault = {
// 			envelope: r.envelope.bind(r),
// 			ok: r.ok.bind(r),
// 			created: r.created.bind(r),
// 			accepted: r.accepted.bind(r),
// 			noContent: r.noContent.bind(r),
// 			list: r.list.bind(r),
// 		};

// 		next();
// 	};
// }
