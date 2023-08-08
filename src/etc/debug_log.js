// etc/debugg_log.js
let DEBUG = false;

function debuglog(message) {
    if (DEBUG) {
        console.log(message);
    }
}