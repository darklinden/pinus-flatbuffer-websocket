const fs = require('fs').promises;

/**
 * 
 * @param {string} file_path 
 * @returns {Promise<boolean>}
 */
async function file_exist(file_path) {
    let exist = false;
    try {
        await fs.access(file_path);
        exist = true;
    } catch (error) {
    }
    return exist;
}

module.exports = file_exist;