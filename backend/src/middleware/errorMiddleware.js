
export function errorMiddleware(err, req, res, next) {

    // Log the actual error in the backend terminal
    console.error("Farm2Home API Error:", err);

    // Use the status code supplied by the controller,
    // otherwise return 500 (Internal Server Error).
    const statusCode = err.statusCode || 500;

    // Send a consistent JSON response
    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error. Please try again later."
                : err.message,
    });
}
