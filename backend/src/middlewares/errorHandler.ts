import { Request, Response, NextFunction } from "express";

export interface ErrorWithStatus extends Error {
	status?: number;
}

export const errorHandler = (
	err: ErrorWithStatus,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error(err.stack);

	res.status(err.status || 500).json({
		message: err.message || "Internal Server Error",
	});
};
