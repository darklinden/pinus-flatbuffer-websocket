import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data"
import { random_string } from "./random_string.js"

const HTTP_TIME_OUT = 3 * 1000;

// export const options = {
//     stages: [
//         { duration: '60s', target: 1000 },
//         { duration: '60s', target: 2000 },
//         { duration: '60s', target: 3000 },
//         { duration: '60s', target: 0 },
//     ]
// };

export default function () {

    let account = random_string(8);
    let password = random_string(8);

    const post_data = `{"account":"${account}","password":"${password}"}`;

    console.log('post_data: ', post_data);

    let res = http.post(`http://127.0.0.1:3000/user/login`, post_data,
        { headers: { "Content-Type": "application/json" }, timeout: HTTP_TIME_OUT });

    console.log(res);
}