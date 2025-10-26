import { useEffect, useState } from 'react';
import { generalAbilityModels } from '../api';

/**
 * 获取大模型列表
 */
export function useModelList() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    generalAbilityModels().then((res) => {
      setModels(res);
      setSelectedModel(res[0]);
    });
  }, []);

  return {
    models,
    selectedModel,
    setSelectedModel,
  };
}
