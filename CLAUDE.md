# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aria (A.R.I.A. - AI Research Assistant) is a Zotero 7 plugin that integrates Large Language Models to assist with research tasks. It uses Qwen (通义千问) models via the DashScope API (OpenAI-compatible).

## Build Commands

```bash
npm install          # Install dependencies (runs patch-package automatically)
npm run build        # Type-check and build plugin (.xpi output in build/)
npm run start        # Start development server with hot reload
npm run lint         # Format with Prettier and fix ESLint issues
npm run build-libs   # Build Rust WASM library for vector search
npm run test-libs    # Test the WASM vector search library
```

## Architecture

### Entry Points
- `src/index.ts` → `src/settings/config.ts`: Initializes global variables and addon instance
- `src/settings/hooks.ts`: Lifecycle hooks (onStartup, onShutdown, onMainWindowLoad)
- `addon/bootstrap.js`: Zotero addon bootstrap

### Core Components

**LLM Integration** (`src/models/`):
- `assistant.ts`: Main `ResearchAssistant` class using OpenAI SDK with DashScope-compatible API
- `chains/`: LangChain-based processing chains
  - `router.ts`: Routes user requests to appropriate handlers
  - `search.ts`: Builds Zotero search queries from natural language
  - `qa.ts`: Question-answering with retrieval
  - `vision.ts`: Visual analysis using Qwen-VL models
- `schemas/`: Zod schemas for structured outputs

**React UI** (`src/views/`):
- `Container.tsx`: Main chat interface container
- `Providers.tsx`: React context providers
- `features/`: Major UI features (messages, input, menus, info panel)
- `components/`: Reusable UI components

**Zotero API Integration** (`src/apis/zotero/`):
- `search.ts`: Library search functionality
- `item.ts`: Item retrieval and file indexing
- `citation.ts`: Citation generation
- `collection.ts`: Collection management

**Data Storage** (`src/db/`):
- Uses Dexie (IndexedDB wrapper) for local file metadata caching

### Configuration

**Preferences** stored in `addon/prefs.js`:
- `OPENAI_MODEL`: Text model (default: `qwen3-max`)
- `VISION_MODEL`: Vision model (default: `qwen3-vl-max`)
- `OPENAI_API_KEY`: DashScope API key
- `OPENAI_BASE_URL`: API endpoint (default: `https://dashscope.aliyuncs.com/compatible-mode/v1`)

**Build Configuration**: `zotero-plugin.config.ts` using `zotero-plugin-scaffold`

### Key Technical Details

- Target: Firefox 115+ (Zotero 7's Gecko engine)
- Styling: TailwindCSS with PostCSS
- TypeScript with strict mode
- Uses `patch-package` for dependency patches (see `patches/`)
- Custom React/React-DOM patches for Zotero compatibility

### Qwen Model Compatibility

The codebase uses OpenAI SDK but targets Qwen models. Notable adaptations:
- Function name `search` renamed to `search_` in `chains/search.ts` (Qwen reserves "search")
- Separate `VISION_MODEL` preference for Qwen-VL models
- Base URL defaults to DashScope's OpenAI-compatible endpoint

### Localization

- `addon/locale/en-US/`: English strings
- `addon/locale/zh-CN/`: Chinese strings
- Uses Fluent (.ftl) format
