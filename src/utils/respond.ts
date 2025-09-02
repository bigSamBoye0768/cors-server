import { Request, Response } from "express";
import { randomUUID, createHash } from "node:crypto";

/** ---- Types ---- */
export type Links = Record<string, string>;
export type MetaBase = { request_id?: string; trace?: string } & Record<string, unknown>;

export type ApiResponse<T> = {
	data: T;
	meta?: MetaBase;
	links?: Links;
};

export type ListMeta = MetaBase & {
	has_more?: boolean;
	next_cursor?: string;
	total_count?: number | null;
};

/** RFC7807 (optional helper if you want to emit errors without middleware) */
export type Problem = {
	type: string;
	title: string;
	status: number;
	detail?: string;
	instance?: string;
	code?: string;
	request_id?: string;
	retryable?: boolean;
	docs?: string;
	invalid_params?: Array<{ name: string; reason: string; code?: string }>;
	meta?: Record<string, unknown>;
};

/** ---- Internals ---- */
function weakEtag(payload: unknown): string {
	const json = typeof payload === "string" ? payload : JSON.stringify(payload);
	const hash = createHash("sha1").update(json).digest("hex");
	return `W/"${hash}"`;
}

/** ---- Builder ---- */
export function responder(req: Request, res: Response) {
	let _status = 200;
	let _meta: MetaBase = {};
	let _links: Links | undefined;
	let _headers: Array<[string, string]> = [];
	let _etag = false;
	let _location: string | undefined;
	let _cache: string | undefined;

	const requestId = (res.getHeader("X-Request-Id") as string) || (req.headers["x-request-id"] as string) || `req_${randomUUID()}`;

	res.setHeader("X-Request-Id", requestId);

	const api = {
		/** Add/override HTTP status */
		status(code: number) {
			_status = code;
			return api;
		},

		/** Add a header */
		header(name: string, value: string) {
			_headers.push([name, value]);
			return api;
		},

		/** Set Cache-Control */
		cache(control: string) {
			_cache = control;
			return api;
		},

		/** Merge meta fields (request_id auto-added) */
		meta(add: Record<string, unknown>) {
			_meta = { ..._meta, ...add };
			return api;
		},

		/** Merge links */
		links(add: Links) {
			_links = { ..._links, ...add };
			return api;
		},

		/** Enable/disable weak ETag + 304 handling for GETs */
		etag(enable = true) {
			_etag = enable;
			return api;
		},

		/** Set Location header (useful for 201/202/204) */
		location(url: string) {
			_location = url;
			return api;
		},

		/** ----- Senders ----- */

		/** Send any payload in the standard { data, meta, links } envelope */
		send<T>(data: T) {
			const body: ApiResponse<T> = { data, meta: { request_id: requestId, ..._meta } };
			if (_links) body.links = _links;

			if (_location) res.setHeader("Location", _location);
			if (_cache) res.setHeader("Cache-Control", _cache);
			for (const [k, v] of _headers) res.setHeader(k, v);

			res.setHeader("Content-Type", "application/json; charset=utf-8");

			// Conditional GET (ETag) for 200 responses
			if (_etag && _status === 200) {
				const tag = weakEtag(body);
				res.setHeader("ETag", tag);
				const inm = req.headers["if-none-match"];
				if (typeof inm === "string" && inm === tag) {
					res.status(304).end();
					return;
				}
			}

			res.status(_status).json(body);
		},

		/** 200 OK shortcut */
		ok<T>(data: T) {
			return api.status(200).send(data);
		},

		/** 201 Created + optional Location header */
		created<T>(data: T, location?: string) {
			if (location) api.location(location);
			return api.status(201).send(data);
		},

		/** 202 Accepted + optional Location (for job tracking) */
		accepted<T>(data: T, location?: string) {
			if (location) api.location(location);
			return api.status(202).send(data);
		},

		/** 200 list helper (adds paging meta/links if provided) */
		list<T>(items: T[], meta?: Partial<ListMeta>, links?: Links) {
			if (links) api.links(links);
			if (meta) api.meta(meta);
			return api.status(200).send(items as unknown as any);
		},

		/** 204 No Content (no envelope) */
		noContent() {
			if (_location) res.setHeader("Location", _location);
			for (const [k, v] of _headers) res.setHeader(k, v);
			if (_cache) res.setHeader("Cache-Control", _cache);
			res.status(204).end();
		},

		/** Emit RFC7807 directly (bypassing the error middleware if you like) */
		problem(p: Problem) {
			const body: Problem = { ...p, request_id: requestId };
			for (const [k, v] of _headers) res.setHeader(k, v);
			res.setHeader("Content-Type", "application/problem+json; charset=utf-8");
			res.status(body.status).json(body);
		},
	};

	return api;
}
