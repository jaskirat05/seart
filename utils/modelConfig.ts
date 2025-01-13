interface ModelNodes {
  promptNode: number;
  seedNode: number;
  dimensionNode: number;
  batchSizeNode?: number;
}

interface ModelConfig {
  nodes: ModelNodes;
  promptField: string;
  seedField: string;
  dimensionFields: {
    width: string;
    height: string;
  };
  batchSizeField?: string;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  pony: {
    nodes: {
      promptNode: 4,
      seedNode: 1,
      dimensionNode: 6,
      batchSizeNode: 6
    },
    promptField: "text",
    seedField: "seed",
    dimensionFields: {
      width: "width",
      height: "height"
    },
    batchSizeField: "batch_size"
  },
  flux: {
    nodes: {
      promptNode: 6,
      seedNode: 25,
      dimensionNode: 5
    },
    promptField: "text",
    seedField: "noise_seed",
    dimensionFields: {
      width: "width",
      height: "height"
    }
  }
};

export function getModelConfig(model: string): ModelConfig {
  const config = MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }
  return config;
}

export function updateWorkflowInputs(workflow: any, settings: any, model: string): void {
  const config = getModelConfig(model);
  
  // Update dimensions
  if (settings.width && settings.height) {
    workflow.input.workflow[config.nodes.dimensionNode].inputs[config.dimensionFields.width] = settings.width;
    workflow.input.workflow[config.nodes.dimensionNode].inputs[config.dimensionFields.height] = settings.height;
  }

  // Update seed if provided
  if (settings.seed !== undefined) {
    workflow.input.workflow[config.nodes.seedNode].inputs[config.seedField] = settings.seed;
  }

  // Update prompt
  if (settings.prompt) {
    workflow.input.workflow[config.nodes.promptNode].inputs[config.promptField] = settings.prompt;
  }

  // Update batch size if supported by the model
  
}
