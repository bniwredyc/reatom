import { Rule } from 'eslint'
import * as estree from 'estree'
import { JSONSchema4 } from 'json-schema'

type RuleCreate<M extends Record<string, string>> = (
  context: RuleContext<M>,
) => RuleListener

type Plain<Dict> = { [Key in keyof Dict]: Dict[Key] & {} }
type MessageVariables<M extends string> =
  M extends `${string}{{${infer Vary}}}${infer Rest}`
    ? Plain<Record<Vary, string> & MessageVariables<Rest>>
    : {}

type RuleListener = {
  [K in keyof Rule.RuleListener]:
    | Rule.RuleListener[K]
    | { run: Rule.RuleListener[K] }
}

export const ruleModule = <Messages extends Record<string, string>>({
  description,
  schema,
  messages,
  create,
}: {
  description: string
  schema: JSONSchema4
  messages: Messages
  create: (context: RuleContext<Messages>) => RuleListener
}): Rule.RuleModule => ({
  meta: {
    docs: {
      description,
      recommended: true,
    },
    messages,
    fixable: 'code',
    type: 'problem',
    schema,
  },
  create: (native) => new RuleContext<Messages>(native)._create(create),
})

export class RuleContext<M extends Record<string, string> = any> {
  constructor(public native: Rule.RuleContext) {}

  option(name: string) {
    return this.native.options[0]?.[name]
  }

  _create(fn: RuleCreate<M>) {
    const rawListener = fn(this)
    const rawListenerEntries = Object.entries(rawListener)
    const listenerEntries = rawListenerEntries.map(([key, val]: [any, any]) => {
      if ('run' in val) val = val.run.bind(val)
      if (typeof val !== 'function') return [key, val] as const

      const wrapped = (...args: Array<any>) => {
        if (key === 'ImportDeclaration') {
          const [node] = args
          this.onImportDeclaration(node)
        }

        val(...args)
      }
      return [key, wrapped] as const
    })
    return Object.fromEntries(listenerEntries)
  }

  report<Key extends Extract<keyof M, string>>(config: {
    node: estree.Node
    messageId: Key
    data: MessageVariables<M[Key]>
    fix?: Rule.ReportFixer | null
  }) {
    this.native.report(config)
  }

  protected reatomImports = new Map<string, string>()
  resolveReatomImport(name: string) {
    return this.reatomImports.get(name)
  }

  protected onImportDeclaration(node: estree.ImportDeclaration) {
    for (const x of node.specifiers) {
      if (x.type === 'ImportSpecifier') {
        this.reatomImports.set(x.local.name, x.imported.name)
      }
    }
  }
}

export function isReatomFactory(context: RuleContext, name: string) {
  if (name.startsWith('reatom')) return true
  const originalName = context.resolveReatomImport(name)
  if (originalName === 'atom') return true
  if (originalName === 'action') return true
  return false
}
