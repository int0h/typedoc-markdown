import * as fs from 'fs-extra';
import {exec} from 'child_process';
import {DocGenerator} from './typedoc-md';
import * as path from 'path';

export function genDocs(cwd, urlBase, outDir){
    const tdmd = new DocGenerator({
        cwd,
        urlBase: urlBase
    });
    const cmd = `cd ${cwd} && node ${path.join(__dirname, './run-td')} --json ${path.join(outDir, '/docs.json')}`;
    exec(cmd, function(error, stdout, stderr) {
        if (stderr) {
            throw new Error(stderr);
        }
        const meta = JSON.parse(fs.readFileSync(`${outDir}/docs.json`).toString());
        const docsArr = tdmd.genDocs(meta);
        docsArr.forEach(doc => {
            const filePath = path.join(outDir, doc.path);
            fs.ensureFileSync(filePath);
            fs.writeFileSync(filePath, doc.content);
        });
    }); 
    
}
