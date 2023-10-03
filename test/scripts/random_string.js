
const random_source_char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const random_source_num = '0123456789';

export function random_string(length) {
    let result = '';
    // char at 0 is not allowed to be a number
    result += random_source_char.charAt(Math.floor(Math.random() * random_source_char.length));
    for (let i = 0; i < length - 1; i++) {
        if (Math.random() < 0.5) {
            result += random_source_char.charAt(Math.floor(Math.random() * random_source_char.length));
        }
        else {
            result += random_source_num.charAt(Math.floor(Math.random() * random_source_num.length));
        }
    }
    return result;
}