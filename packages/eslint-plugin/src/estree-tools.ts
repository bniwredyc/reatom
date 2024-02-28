import { Rule } from 'eslint'
import type * as estree from 'estree'

export const ascend = <Type extends estree.Node['type']>(
  node: estree.Node,
  types: Array<Type>,
) => {
  while (node && !types.includes(node.type as any)) {
    node = (node as any).parent
  }

  return node as Extract<Rule.Node, { type: Type }> | undefined
}

/**
 * Returns an array of identifiers declared with parameters or function-scoped variable declarations.
 * Doesn't handle `var`-s declared in nested blocks.
 */
export function* getFunctionNames(
  fn:
    | estree.FunctionExpression
    | estree.ArrowFunctionExpression
    | estree.FunctionDeclaration,
) {
  for (const param of fn.params) {
    yield* getPatternNames(param)
  }

  if (fn.body.type === 'BlockStatement') {
    for (const statement of fn.body.body) {
      yield* getStatementNames(statement)
    }
  }
}

export function* getProgramNames(program: estree.Program) {
  for (const statement of program.body) {
    yield* getStatementNames(statement)
  }
}

function* getStatementNames(
  statement: estree.Statement | estree.ModuleDeclaration,
) {
  if (statement.type !== 'VariableDeclaration') return
  for (const declaration of statement.declarations) {
    yield* getPatternNames(declaration.id)
  }
}

function* getPatternNames(node: estree.Pattern): Generator<string> {
  if (node.type === 'AssignmentPattern') {
    node = node.left
  }

  if (node.type === 'RestElement') {
    node = node.argument
  }

  if (node.type === 'ObjectPattern') {
    for (const property of node.properties) {
      if (property.computed) continue
      yield* getPatternNames(property.key as estree.Pattern)
    }
  }

  if (node.type === 'ArrayPattern') {
    for (const element of node.elements) {
      yield* getPatternNames(element)
    }
  }

  if (node.type === 'Identifier') {
    yield node.name
  }
}
