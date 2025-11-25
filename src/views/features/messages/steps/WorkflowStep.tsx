import React, { useEffect } from "react"
import {
  WorkflowStepContent,
  WorkflowStepControl,
  SearchWorkflowStepContent,
  QAWorkflowStepContent,
} from "../../../../typings/steps"
import { CodeHighlighter } from "../../../components/code/CodeHighlighter"
import stringify from "json-stringify-pretty-compact"
import { SearchWorkflow } from "../workflows/SearchWorkflow"
import { QAWorkflow } from "../workflows/QAWorkflow"

export interface WorkflowStepProps {
  content: WorkflowStepContent
  control: WorkflowStepControl
}

export function WorkflowStep({ content, control }: WorkflowStepProps) {
  switch (content.params.workflow.type) {
    case "search": {
      return <SearchWorkflow content={content as SearchWorkflowStepContent} control={control} />
    }
    case "qa": {
      return <QAWorkflow content={content as QAWorkflowStepContent} control={control} />
    }
    default: {
      return <CodeHighlighter code={stringify(content)} language="json" />
    }
  }
}
