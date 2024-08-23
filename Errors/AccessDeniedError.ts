export class AccessDeniedError extends Error {
    constructor(error: Error, message = "Access denied") {
        console.error(error);
        super(message);
    }
}
