import { CsvParser } from './CsvParser';
import fs = require("fs");

export class CsvUtil {
    private static _parser: CsvParser = null;
    private static get parser(): CsvParser {
        this._parser = this._parser || new CsvParser();
        return this._parser;
    }

    public static loadDataSync(src_file: string): string[][] {

        const original = fs.readFileSync(src_file, { encoding: 'utf8' });

        try {
            let rows = this.parser.parse(original);
            return rows as string[][];
        } catch (ex) {
            console.error(ex);
        }

        return null;
    }
}
