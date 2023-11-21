import { promises as fs } from 'fs';

export async function process_sql_file(file_path: string): Promise<string[]> {

    // Extract SQL queries from file.
    let content = await fs.readFile(file_path);

    let linse = content.toString().split("\n");
    // Remove comments and empty lines
    let sqls: string[] = [];
    for (let line of linse) {
        if (line.startsWith("--")) {
            continue;
        }

        line = line.trim();
        if (line.length > 0) {
            sqls.push(line);
        }
    }

    let queries = sqls.join(" ") // make one string
        .split(";"); // split into all statements

    sqls = [];
    for (const q of queries) {
        let query_check = q.toUpperCase();
        if (query_check.indexOf("COPY") === 0) {
            throw new Error("SQL file contains COPY command which is not supported.");
        }

        let query = q.trim();
        if (query.length > 0) {
            sqls.push(query);
        }
    }

    return sqls;
}