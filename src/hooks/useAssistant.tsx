import React, { useMemo, createContext, useContext } from "react"
import { ResearchAssistant } from "../models/assistant"
import { ConversationInfo } from "./useMessages"
import { getPref } from "../utils/prefs"

interface AssistantContextType {
  assistant: ResearchAssistant
}

const AssistantContext = createContext<AssistantContextType | undefined>(
  undefined,
)

interface AssistantProviderProps {
  children: React.ReactNode
}

export const AssistantContextProvider: React.FC<AssistantProviderProps> = ({
  children,
}) => {
  const assistant = useMemo(
    () =>
      new ResearchAssistant({
        models: {
          default: (getPref("OPENAI_MODEL") as string) || "qwen-max",
          vision: (getPref("VISION_MODEL") as string) || "qwen-vl-max",
        },
        messageStore: addon.data.popup.messageStore,
      }),
    [],
  )

  return (
    <AssistantContext.Provider value={{ assistant }}>
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (!context) {
    throw new Error("useAssistant must be used within an AssistantProvider")
  }
  return context
}
