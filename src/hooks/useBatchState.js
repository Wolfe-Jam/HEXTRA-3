import { useState, useCallback } from 'react';

const useBatchState = () => {
  const [batchStatus, setBatchStatus] = useState('');
  const [batchProgress, setBatchProgress] = useState(0);

  const updateBatchProgress = useCallback((progress, status) => {
    setBatchProgress(progress);
    setBatchStatus(status);
  }, []);

  return {
    batchStatus,
    batchProgress,
    updateBatchProgress
  };
};

export default useBatchState;
