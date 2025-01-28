// Processor definitions for HEXTRA and Voidbox

export const PROCESSORS = {
  // HEXTRA: Visualization and Color Processing
  HEXTRA: {
    type: 'hextra',
    operations: {
      colorize: {
        processor: 'hextra',
        immediate: true,
        description: 'Apply color with luminance preservation'
      },
      luminance: {
        processor: 'hextra',
        immediate: true,
        description: 'Luminance calculations and adjustments'
      },
      export: {
        processor: 'hextra',
        immediate: true,
        description: 'Export with format options'
      }
    }
  },

  // Voidbox: Image Generation and Manipulation
  VOIDBOX: {
    type: 'voidbox',
    operations: {
      generate: {
        processor: 'voidbox',
        immediate: false,
        description: 'AI image generation',
        params: {
          prompt: 'string',
          style: 'optional'
        }
      },
      zbg: {
        processor: 'voidbox',
        immediate: false,
        description: 'Zero Background generation with alpha channel',
        params: {
          prompt: 'string',
          transparency: 'required'
        }
      }
    }
  }
};

export function categorizeOperation(operation) {
  // Determine if operation should use HEXTRA or Voidbox
  if (PROCESSORS.HEXTRA.operations[operation]) {
    return 'hextra';
  }
  if (PROCESSORS.VOIDBOX.operations[operation]) {
    return 'voidbox';
  }
  throw new Error(`Unknown operation: ${operation}`);
}

export function isImmediate(operation) {
  const hextraOp = PROCESSORS.HEXTRA.operations[operation];
  return hextraOp ? hextraOp.immediate : false;
}

export function needsVoidbox(operations) {
  return operations.some(op => 
    PROCESSORS.VOIDBOX.operations[op.type]
  );
}
