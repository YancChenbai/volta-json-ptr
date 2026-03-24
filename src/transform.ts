import MagicString from 'magic-string';
import { CallExpression, parse, ParseResult, Visitor } from 'oxc-parser';

import { transformPointerToChain } from '#shared';

const PACKAGE_NAME = 'volta-json-ptr';
const MACRO_FUNCTION = 'seek';

export enum FileType {
  JS = 'js',
  VUE = 'vue',
}

function findPackImport(ast: ParseResult) {
  return ast.module.staticImports.find((i) => i.moduleRequest.value === PACKAGE_NAME);
}

export function findMethodImport(ast: ParseResult) {
  const imp = findPackImport(ast);

  if (!imp) {
    return null;
  }

  const seekIndex = imp.entries.findIndex((i) => i.importName.name === MACRO_FUNCTION && !i.isType);

  // no macro function
  if (seekIndex === -1) return null;

  const { entries } = imp;

  // only macro function
  if (entries.length === 1) {
    return [imp.start, imp.end] as const;
  }

  const entry = entries[seekIndex]!;
  let start = entry.importName.start!;
  let end = entry.localName.end ?? entry.importName.end;

  // remove `,`
  // is not last
  if (seekIndex < entries.length - 1) {
    const nextEntry = entries[seekIndex + 1];
    end = nextEntry?.importName.start ?? end;
  }
  // is not first
  else if (seekIndex > 0) {
    const prevEntry = entries[seekIndex - 1];
    start = prevEntry?.importName.end ?? start;
  }

  return [start, end] as const;
}

function recognizeJS(node: CallExpression) {
  if (node.callee.type !== 'Identifier') return null;
  if (node.callee.name !== MACRO_FUNCTION) return null;

  return node;
}

function recognizeVue(node: CallExpression) {
  if (node.callee.type !== 'MemberExpression') return null;

  const { object, property } = node.callee;

  if (object.type !== 'Identifier' || property.type !== 'Identifier') return null;

  if (!['_ctx', '$setup'].includes(object.name)) return null;

  if (property.name === MACRO_FUNCTION) return node;

  return null;
}

function matchMacroCall(node: CallExpression, fileType: FileType = FileType.JS) {
  if (fileType === FileType.VUE) {
    const vueNode = recognizeVue(node);
    if (vueNode) return vueNode;
  }

  return recognizeJS(node);
}

function getFileType(id: string) {
  if (id.includes('.vue')) return FileType.VUE;

  return FileType.JS;
}

export function handleSeekMacro(ast: ParseResult, fileType: FileType = FileType.JS) {
  let hasDynamicPath = false;
  let hasAnyCall = false;

  const list: [
    callRange: { start: number; end: number },
    receiverRange: { start: number; end: number },
    path: string,
  ][] = [];
  const visitor = new Visitor({
    CallExpression(node) {
      const matchNode = matchMacroCall(node, fileType);

      if (!matchNode) return;

      hasAnyCall = true;
      const [arg0, arg1] = matchNode.arguments;

      // find `seek` call, must static path
      if (
        matchNode.arguments.length == 2 &&
        arg0 &&
        arg1?.type === 'Literal' &&
        typeof arg1.value === 'string'
      ) {
        list.push([
          { start: matchNode.start, end: matchNode.end },
          { start: arg0.start, end: arg0.end },
          arg1.value,
        ]);
      } else {
        hasDynamicPath = true;
      }
    },
  });

  visitor.visit(ast.program);

  return {
    list,
    hasDynamicPath,
    hasAnyCall,
  };
}

export async function transform(code: string, id: string) {
  const ast = await parse(id, code);
  const s = new MagicString(code);
  const fileType = getFileType(id);

  const { list, hasDynamicPath, hasAnyCall } = handleSeekMacro(ast, fileType);

  list.forEach(([callRange, receiverRange, path]) => {
    const overwrite =
      code.substring(receiverRange.start, receiverRange.end) + transformPointerToChain(path);

    s.overwrite(callRange.start, callRange.end, overwrite);
  });

  if (hasAnyCall) {
    const range = findMethodImport(ast);

    // has dynamic path and no method import
    if (hasDynamicPath && !range) {
      s.prepend(`import { ${MACRO_FUNCTION} } from '${PACKAGE_NAME}';\n`);
    }

    // not has dynamic path. remove import
    else if (!hasDynamicPath && range) {
      s.remove(range[0], range[1]);
    }
  }

  if (!s.hasChanged()) return null;

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true }),
  };
}
