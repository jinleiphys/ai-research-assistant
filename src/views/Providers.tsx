import React, { Component, ErrorInfo, ReactNode } from "react"
import { Container } from "./Container"
import { DialogContextProvider } from "../hooks/useDialog"
import { DraggingContextProvider } from "../hooks/useDragging"
import { AssistantContextProvider } from "../hooks/useAssistant"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Aria Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", backgroundColor: "white", height: "100%", overflow: "auto" }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "12px" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

export function Providers(props: any, ref: any) {
  return (
    <ErrorBoundary>
      <DialogContextProvider>
        <DraggingContextProvider>
          <AssistantContextProvider>
            <Container />
          </AssistantContextProvider>
        </DraggingContextProvider>
      </DialogContextProvider>
    </ErrorBoundary>
  )
}
