import React, { memo, useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { RTVIEvent } from "realtime-ai";
import { RTVIClientVideo, useRTVIClientEvent } from "realtime-ai-react";

import { cn } from "@/utils/tailwind";

import CameraFlipButton from "../../ui/camera-flip-button";

import ModelBadge from "./model";
import WaveForm from "./waveform";

import styles from "./styles.module.css";

export const Agent: React.FC<{
  isReady: boolean;
  statsAggregator: StatsAggregator;
}> = memo(
  ({ isReady, statsAggregator }) => {
    const [hasStarted, setHasStarted] = useState<boolean>(false);
    const [botStatus, setBotStatus] = useState<
      "initializing" | "connected" | "disconnected"
    >("initializing");
    const [botIsTalking, setBotIsTalking] = useState<boolean>(false);

    useEffect(() => {
      // Update the started state when the transport enters the ready state
      if (!isReady) return;
      setHasStarted(true);
      setBotStatus("connected");
    }, [isReady]);

    useRTVIClientEvent(
      RTVIEvent.BotDisconnected,
      useCallback(() => {
        setHasStarted(false);
        setBotStatus("disconnected");
      }, [])
    );

    useRTVIClientEvent(
      RTVIEvent.BotStartedSpeaking,
      useCallback(() => {
        setBotIsTalking(true);
      }, [])
    );

    useRTVIClientEvent(
      RTVIEvent.BotStoppedSpeaking,
      useCallback(() => {
        setBotIsTalking(false);
      }, [])
    );

    // Cleanup
    useEffect(() => () => setHasStarted(false), []);

    const cx = clsx(
      styles.agentWindow,
      hasStarted && styles.ready,
      botIsTalking && styles.talking
    );

    return (
      <div className={cn(styles.agent, "relative")}>
        <div className={cx}>
          <ModelBadge />
          {!hasStarted ? (
            <span className={styles.loader}>
              <Loader2 size={32} className="animate-spin" />
            </span>
          ) : (
            <WaveForm />
          )}
        </div>
        <RTVIClientVideo
          participant="local"
          mirror={true}
          className={styles.video}
        />
        <div className="absolute top-4 right-4 z-10">
          <CameraFlipButton />
        </div>
      </div>
    );
  },
  (p, n) => p.isReady === n.isReady
);
Agent.displayName = "Agent";

export default Agent;
