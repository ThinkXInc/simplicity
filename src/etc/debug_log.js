// etc/debugg_log.js
let DEBUG = true;

function debuglog(message) {
    if (DEBUG) {
        const e = new Error();
        const stack = e.stack.toString().split(/\r\n|\n/);
        console.log(`${message} (${stack[2].trim()})`);
    }
}