import React from "react";
import { RTVIEvent } from "realtime-ai";
import {
  useRTVIClient,
  useRTVIClientEvent,
  useRTVIClientTransportState,
} from "realtime-ai-react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const voiceClient = useRTVIClient()!;
  const transportState = useRTVIClientTransportState();
  const [model, setModel] = React.useState<string | undefined>(undefined);

  const getModelFromConfig = async () => {
    if (!voiceClient || transportState !== "ready") return;

    try {
      const serviceOptions = await voiceClient.getServiceOptionsFromConfig(
        "llm"
      );
      const modelOption = serviceOptions?.options?.find(
        (option) => option.name === "model"
      );
      if (modelOption) {
        setModel(modelOption.value as string);
      }
    } catch (error) {
      console.warn("Failed to get model from config:", error);
    }
  };

  React.useEffect(() => {
    if (transportState === "ready") {
      getModelFromConfig();
    }
  }, [voiceClient, transportState]);

  useRTVIClientEvent(RTVIEvent.Connected, () => {
    getModelFromConfig();
  });

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
