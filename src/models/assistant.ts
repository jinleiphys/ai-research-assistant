import { serializeError } from "serialize-error"
import OpenAI from "openai"
import { ChatCompletionMessageParam, ChatCompletionChunk } from "openai/resources/chat/completions"
import { Stream } from "openai/streaming"
import { simplifyStates, serializeStates } from "./utils/states"
import { getPref, setPref, clearPref } from "../utils/prefs"
import { config } from "../../package.json"
import { MessageStore } from "../utils/messageStore"
import { assistant as log } from "../utils/loggers"
import { createCitations } from "../apis/zotero/citation"
import chunk from "lodash/chunk"
import * as db from "../db/client"
import { SimplifiedStates, UserInput } from "../typings/input"

interface ModelSet {
  default: string
  vision: string
}

interface ResearchAssistantFields {
  models: ModelSet
  messageStore: MessageStore
}

// Chat history for context
interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export class ResearchAssistant {
  models: ModelSet
  openai: OpenAI
  chatHistory: ChatMessage[] = []
  currentVectorStore?: string
  private abortController?: AbortController

  constructor({ models }: ResearchAssistantFields) {
    this.models = models
    this.openai = new OpenAI({
      apiKey: getPref("OPENAI_API_KEY") as string,
      baseURL: (getPref("OPENAI_BASE_URL") as string) || "https://dashscope.aliyuncs.com/compatible-mode/v1",
      dangerouslyAllowBrowser: true,
    })
  }

  setThread(threadId: string) {
    // For chat completions API, we manage history locally
    // threadId is kept for compatibility but not used
  }

  setVectorStore(vectorStoreId: string) {
    this.currentVectorStore = vectorStoreId || undefined
  }

  async ensureThread(): Promise<string> {
    // No thread needed for chat completions API
    return "local"
  }

  // Stream a chat completion message
  streamMessage(contentValue: string, states: SimplifiedStates): Stream<ChatCompletionChunk> {
    log("Streaming message with chat completions API")

    // Build the user message with context
    const userMessage = `${serializeStates(states)}${contentValue}`

    // Add to chat history
    this.chatHistory.push({
      role: "user",
      content: userMessage,
    })

    // Build messages array for API call
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are Aria, an AI research assistant integrated with Zotero. You help users manage their research library, search for papers, summarize documents, and answer questions about their research.

Today is ${new Date().toDateString()}.

When users mention items with @ (creators), # (tags), / (items), or ^ (collections), these refer to items in their Zotero library.

Be helpful, concise, and accurate. If you don't know something, say so.`,
      },
      ...this.chatHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ]

    // Create abort controller for this request
    this.abortController = new AbortController()

    // Create the stream
    const stream = this.openai.chat.completions.create({
      model: this.models.default,
      messages,
      stream: true,
    }, {
      signal: this.abortController.signal,
    })

    return stream as unknown as Stream<ChatCompletionChunk>
  }

  // Simple non-streaming completion for internal use
  async complete(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.models.default,
      messages: [
        { role: "user", content: prompt },
      ],
    })
    return response.choices[0]?.message?.content || ""
  }

  // Add assistant response to history (called after stream completes)
  addAssistantMessage(content: string) {
    this.chatHistory.push({
      role: "assistant",
      content,
    })
  }

  // For backward compatibility - not used with chat completions
  streamTools(toolOutputs: any[]) {
    log("streamTools not supported with chat completions API")
    throw new Error("streamTools not supported with chat completions API")
  }

  // For backward compatibility - simplified QA
  streamQA(question: string): Stream<ChatCompletionChunk> {
    log("Streaming QA with chat completions API")
    return this.streamMessage(question, {})
  }

  abortAll() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = undefined
    }
  }

  async resetMemory() {
    this.chatHistory = []
  }

  // File operations - kept for compatibility but may not work with DashScope
  async getFileMetadata(fileId: string) {
    const existingMetadata = await db.getFile(fileId)
    log(`Existing metadata for ${fileId}`, existingMetadata)
    if (existingMetadata) {
      return existingMetadata
    }
    // Simplified - return basic metadata
    return {
      id: fileId,
      vectorStoreIds: [],
      itemId: 0,
      itemType: "unknown",
      attachmentId: 0,
      attachmentType: "unknown",
      bib: "",
      timestamp: new Date().toISOString(),
    }
  }

  async uploadFile(
    item: Zotero.Item,
    attachment: Zotero.Item,
    purpose: string,
  ) {
    log("File upload not supported with DashScope API")
    return `local/${item.id}/${attachment.id}`
  }

  registerUploadedFile(item: Zotero.Item, attachment: Zotero.Item, fileId: string) {
    ztoolkit.ExtraField.setExtraField(
      item,
      "aria.file",
      `${attachment.id};${fileId}`,
    )
  }

  async indexFile(fileId: string) {
    log("File indexing not supported with DashScope API")
    return { status: "not_supported" }
  }

  registerIndexedFile(item: Zotero.Item) {
    const fileInfo = ztoolkit.ExtraField.getExtraField(item, "aria.file")
    if (!fileInfo) {
      throw new Error(`The item ${item.id} does not have an aria.file record.`)
    }
  }

  async clearFileIndex(setProgress: (pct: number) => void) {
    log("clearFileIndex not fully supported with DashScope API")
    setProgress(100)
  }

  async rebuildFileCache(setProgress: (pct: number) => void) {
    log("rebuildFileCache not fully supported with DashScope API")
    setProgress(100)
  }

  async parseAnnotatedText({ value = "", annotations = [] }: { value?: string; annotations?: any[] }) {
    // No annotations with chat completions API
    return { text: value, citations: [] }
  }
}
