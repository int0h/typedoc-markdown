import * as path from 'path';

const types = {
    Function: 64,
    Interface: 256,
    Property: 1024
}

export interface RefRecord {
    meta: any;
    place: string;
}

export interface DocGenCfg {
    cwd: string;
    urlBase: string;
}

export interface DocEntity {
    content: string;
    path: string;
}

export class DocGenerator {
    linkTable: {[key: string]: RefRecord};
    cwd: string;
    urlBase: string;

    constructor (cfg: DocGenCfg) {
        this.cwd = cfg.cwd;
        this.urlBase = cfg.urlBase;
        this.linkTable = {};
    }

    getPath(absPath: string): string {
        return path.relative(this.cwd, absPath)
            .replace(/\\/g, '/')
            .replace(/\.[^\.]*$/, '.md');
    }

    getSignatureCode(meta) {
        if (!meta) {
            return [];
        }
        const resultType = this.type(meta.type, false);
        return [            
            '```typescript',
            `(${this.args(meta.parameters)}) => ${resultType}`,
            '```'       
        ]
    }

    signature(meta) {
        const name = meta.name;
        const typeArgs = this.typeParam(meta.typeParameter);
        let lines = [
            `Function [${name + typeArgs}]`,
            '===',
            '',
            'Signature',
            '---'
        ];    
        lines = lines.concat(this.getSignatureCode(meta));
        lines.push('');
        if (meta.comment) {
            lines = lines.concat([
                'Description',
                '---',
                meta.comment.shortText,
                ''     
            ]);
        }
        lines = lines.concat(this.params(meta.parameters));
        return lines.join('\n');
    }

    params(meta) {
        if (!meta || meta.length === 0) {
            return [];
        }
        let lines = [
            'Parameters',
            '---'
        ];
        lines = lines.concat(meta.map(param => {
            const desc = param.comment
                ? ` - ${param.comment.text}`
                : '';
            return `- **${param.name}**: ${this.type(param.type)}` + desc;
        }));
        return lines;
    }

    args(meta) {
         if (!meta || meta.length === 0) {
            return '';
        }
        return meta
            .map(arg => `${arg.name}: ${this.type(arg.type, false)}`)
            .join(', ');
    }    

    interface(meta) {
        let lines = [];
        if (meta.id) {
            lines.push(`<a name="id-${meta.id}"></a>`);
        }
        lines.push(
            `Interface [${meta.name}]`,
            '===',
            ''
        );
        if (meta.signatures) {
            lines.push(
                'Signature',
                '---',
                ...this.getSignatureCode(meta.signatures[0])
            );
        }      
        if (meta.children && meta.children.length > 0) {
            const props = meta.children.filter(prop => prop.kind = types.Property);
            lines.push(
                'Propeties:',
                '---'
            );
            lines = lines.concat(props.map(prop => {
                return `- ${prop.name}: ${this.type(prop.type)}`
            }));
            lines.push('');
        }
        return lines.join('\n');
    }

    ref(refData: RefRecord, text) {
        const path = this.getPath(refData.place);
        const hash = 'id-' + refData.meta.id;        
        const url = [this.urlBase, path, '#', hash].join('');
        return `[${text}](${url})`;
    }

    type(meta, allowLinks=true) {
        let res = meta.name;
        if (meta.typeArguments && meta.typeArguments.length > 0) {

        }
        if (allowLinks && meta.type === 'reference' && meta.id) {
            const ref = this.linkTable[meta.id];
            res = this.ref(ref, res);
        }
        return res;
    }

    typeParam(meta) {
        if (!meta || meta.length === 0){
            return '';
        }
        const typeList = meta.map(m => m.name).join(', ');
        return `\\<${typeList}\\>`;
    }

    any(meta) {
        switch (meta.kind) {
            case types.Function:
                return this.signature(meta.signatures[0]);
            case types.Interface:
                return this.interface(meta);        
        }
    }

    genDocs(meta): DocEntity[] {
        meta.children.forEach(module => {
            module.children
                .forEach(item => {
                    if (item.id) {
                        this.linkTable[item.id] = {
                            meta: item,
                            place: module.originalName
                        };
                    }
                })
        });
        return meta.children.map(module => ({
            path: this.getPath(module.originalName),
            content: module.children
                .map(item => this.any(item))
                .join('\n\n')
        }));
    }
}
