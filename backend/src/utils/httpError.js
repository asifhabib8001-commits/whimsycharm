module.exports = (message, status = 400) => Object.assign(new Error(message), { status });
