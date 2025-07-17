

class AppError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string, stack = '') {
        super(message); // throw new Error("Something went wrong") ei kaj ti korbe
        this.statusCode = statusCode;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        };

        /**
         * usually ei if else block ta use kora hobena,but jodi laghe,tai likha holo!
         * else er ta hocce default Error tekhe je stack pawa jabhe seti,,
         * if block ta hocce jeta customized stack asbe
         */
    }
};

export default AppError;