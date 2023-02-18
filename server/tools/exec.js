const process_exec = require('node:child_process').exec

async function exec(command) {
    return new Promise((resolve, reject) => {
        process_exec(command, (err, output) => {
            // once the command has completed, the callback function is called
            if (err) {
                // log and return if we encounter an error
                reject(err);
            }
            else {
                resolve(output);
            }
        })
    })
}

module.exports = exec