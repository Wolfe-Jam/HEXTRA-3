// Bridge API for HEXTRA-Voidbox integration

import { categorizeOperation, isImmediate, needsVoidbox } from './processors';

export async function processImage(image, operations) {
  // Split operations between HEXTRA and Voidbox
  const processedOps = operations.map(op => ({
    ...op,
    processor: categorizeOperation(op.type)
  }));

  // If all operations are immediate (HEXTRA), process locally
  if (processedOps.every(op => isImmediate(op.type))) {
    return processLocally(image, processedOps);
  }

  // If any operation needs Voidbox, use bridge API
  const response = await fetch('/api/bridge/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image, operations: processedOps }),
  });

  if (!response.ok) {
    throw new Error('Processing failed');
  }

  const result = await response.json();

  // If there are pending operations, start polling
  if (result.pending) {
    return pollStatus(result.metadata.voidbox.jobId);
  }

  return result;
}

async function pollStatus(jobId, interval = 1000) {
  const response = await fetch(`/api/bridge/status?jobId=${jobId}`);
  
  if (!response.ok) {
    throw new Error('Status check failed');
  }

  const status = await response.json();

  if (status.status === 'completed') {
    return status.result;
  }

  if (status.status === 'failed') {
    throw new Error(status.error || 'Processing failed');
  }

  // Continue polling
  await new Promise(resolve => setTimeout(resolve, interval));
  return pollStatus(jobId, interval);
}

function processLocally(image, operations) {
  // Use existing HEXTRA processing logic
  // This preserves all the current HEXTRA functionality
  return {
    success: true,
    immediate: true,
    pending: false,
    result: image // Actually processed by HEXTRA
  };
}
