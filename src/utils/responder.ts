import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

export type Links = Record<string, string>;
export type MetaBase = { request_id: string; trace?: string } & Record<string, unknown>;

export type Envelope<T, M extends Record<string, unknown> = {}> = {
	data: T;
	meta?: MetaBase & Partial<M>; // <-- Partial so request_id alone is fine
	links?: Links;
} & Record<string, unknown>; // allows flexible top-level extensions (e.g. included, warnings)

export type SendOptions<M extends Record<string, unknown> = {}> = {
	meta?: M; // extra meta fields
	links?: Links; // pagination or nav links
	etag?: string; // sets ETag
	cacheControl?: string; // sets Cache-Control
	headers?: Record<string, string | number>; // any extra headers
	extend?: Record<string, unknown>; // add arbitrary top-level fields to envelope
	location?: string; // sets Location for 201/202
};

export type ListOptions<T, M extends Record<string, unknown> = {}> = SendOptions<M> & {
	hasMore: boolean;
	nextCursor?: string;
	totalCount?: number | null;
	mapItem?: (item: T) => unknown; // optional projector
};

function getRequestId(req: Request, res: Response): string {
	// Prefer inbound X-Request-Id; else synthesize and echo
	const inbound = (req.headers["x-request-id"] as string) || (res.getHeader("X-Request-Id") as string);
	return inbound ?? `req_${randomUUID()}`;
}

function setCommonHeaders(res: Response, opts?: SendOptions) {
	if (!res.getHeader("Content-Type")) {
		res.setHeader("Content-Type", "application/json; charset=utf-8");
	}
	if (opts?.etag) res.setHeader("ETag", opts.etag);
	if (opts?.cacheControl) res.setHeader("Cache-Control", opts.cacheControl);
	if (opts?.headers) {
		for (const [k, v] of Object.entries(opts.headers)) res.setHeader(k, String(v));
	}
	if (opts?.location) res.setHeader("Location", opts.location);
}

export class Responder {
	private baseMeta?: Record<string, unknown>;

	constructor(private req: Request, private res: Response, baseMeta?: Record<string, unknown>) {
		this.baseMeta = baseMeta ?? {};
	}

	/** Build the envelope only (useful if you want to manipulate it before sending). */
	envelope<T, M extends Record<string, unknown> = {}>(data: T, opts?: SendOptions<M>): Envelope<T, M> {
		const requestId = getRequestId(this.req, this.res);
		this.res.setHeader("X-Request-Id", requestId);

		// merged meta with safe cast
		const meta = {
			request_id: requestId,
			...(this.baseMeta ?? {}),
			...(opts?.meta ?? {}),
		} as MetaBase & Partial<M>;

		const env: Envelope<T, M> = {
			data,
			meta,
			...(opts?.links ? { links: opts.links } : {}),
		};

		if (opts?.extend) {
			for (const [k, v] of Object.entries(opts.extend)) {
				// don't clobber known keys unless you really mean to
				if (k !== "data" && k !== "meta" && k !== "links") {
					(env as Record<string, unknown>)[k] = v;
				}
			}
		}

		return env;
	}

	/** 200 OK */
	ok<T, M extends Record<string, unknown> = {}>(data: T, opts?: SendOptions<M>) {
		setCommonHeaders(this.res, opts);
		return this.res.status(200).json(this.envelope(data, opts));
	}

	/** 201 Created (sets Location if provided) */
	created<T, M extends Record<string, unknown> = {}>(data: T, opts?: SendOptions<M>) {
		setCommonHeaders(this.res, opts);
		return this.res.status(201).json(this.envelope(data, opts));
	}

	/** 202 Accepted (use for jobs/async ops) */
	accepted<T, M extends Record<string, unknown> = {}>(data: T, opts?: SendOptions<M>) {
		setCommonHeaders(this.res, opts);
		return this.res.status(202).json(this.envelope(data, opts));
	}

	/** 204 No Content (useful for deletes/confirmations) */
	noContent(opts?: Omit<SendOptions, "meta" | "links" | "extend">) {
		setCommonHeaders(this.res, opts);
		// No body for 204
		return this.res.status(204).end();
	}

	/** 200 OK list with pagination metadata */
	list<T, M extends Record<string, unknown> = {}>(items: T[], listOpts: ListOptions<T, M>) {
		const { hasMore, nextCursor, totalCount = null, mapItem, ...rest } = listOpts;

		const projected = mapItem ? items.map(mapItem) : items;

		const env = this.envelope(projected as unknown as T[], {
			...rest,
			meta: {
				...(rest.meta as M),
				has_more: hasMore,
				next_cursor: nextCursor,
				total_count: totalCount,
			},
		});

		setCommonHeaders(this.res, rest);
		return this.res.status(200).json(env);
	}
}

/** Convenience factory so you can do `const r = responder(req,res)` */
export const responder = (req: Request, res: Response, baseMeta?: Record<string, unknown>) => new Responder(req, res, baseMeta);
