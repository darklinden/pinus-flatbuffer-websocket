import { promises as fs } from 'fs';
import { CsvParser } from './CsvParser';

export class CsvUtil {
    private static _parser: CsvParser = null;
    private static get parser(): CsvParser {
        this._parser = this._parser || new CsvParser();
        return this._parser;
    }

    public static async loadDataSync(src_file: string): Promise<string[][]> {

        const original = await fs.readFile(src_file, { encoding: 'utf8' });

        try {
            let rows = this.parser.parse(original);
            return rows as string[][];
        } catch (ex) {
            console.error(ex);
        }

        return null;
    }
}
