import { ascend } from '../estree-tools'
import { isReatomFactory, ruleModule } from '../rule'

// export const asyncRule = ruleModule({
//   description:
//     'Ensures that asynchronous interactions within Reatom functions are wrapped with `ctx.schedule`.',
//   schema: {},
//   messages: {
//     scheduleMissing:
//       'Asynchronous interactions within Reatom functions should be wrapped with `ctx.schedule`',
//   },
//   create: (context) => ({
//     AwaitExpression(node) {
//       const fn = ascend(node, ['ArrowFunctionExpression', 'FunctionExpression'])
//       if (!fn) return

//       if (fn.parent.type !== 'CallExpression') return
//       if (fn.parent.callee.type !== 'Identifier') return
//       if (!isReatomFactory(context, fn.parent.callee.name)) return

//       if (
//         node.argument.type === 'CallExpression' &&
//         node.argument.callee.type === 'MemberExpression' &&
//         node.argument.callee.object.type === 'Identifier' &&
//         node.argument.callee.object.name === 'ctx' &&
//         node.argument.callee.property.type === 'Identifier' &&
//         node.argument.callee.property.name === 'schedule'
//       ) {
//         return
//       }

//       context.report({
//         node,
//         messageId: 'scheduleMissing',
//         data: {},
//         fix: (fixer) => [
//           fixer.insertTextBefore(node.argument, 'ctx.schedule(() => '),
//           fixer.insertTextAfter(node.argument, ')'),
//         ],
//       })
//     },
//   }),
// })
