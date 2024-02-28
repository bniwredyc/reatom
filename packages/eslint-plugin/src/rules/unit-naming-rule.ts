import * as estree from 'estree'
import { Rule } from 'eslint'
import { ascend, getFunctionNames } from '../estree-tools'
import { RuleContext, isReatomFactory, ruleModule } from '../rule'

export const unitNamingRule = ruleModule({
  description: 'Ensures that all Reatom entities are correctly named.',
  messages: {
    nameMissing: 'Unit "{{unit}}" is missing a name',
    nameIncorrect: 'Unit "{{unit}}" has malformed name',
    prefixMissing: 'Atom "{{unit}}" name should start with "{{prefix}}"',
    postfixMissing: 'Atom "{{unit}}" name should end with "{{postfix}}"',
  } as const,
  schema: [
    {
      type: 'object',
      properties: {
        domain: { type: 'string' },
        atomPrefix: { type: 'string' },
        atomPostfix: { type: 'string' },
      },
    },
  ],
  create: (context) => ({
    CallExpression(call) {
      // TODO
    },
  }),
})
