---
name: openai-realtime-voice
description: Adding OpenAI Realtime voice control to a React or Next.js application. Choosing between realtime-voice-component, raw Realtime API, and openai-agents-js. Designing app-owned voice tools with defineVoiceTool and Zod schemas. Building a secure /session endpoint for OpenAI Realtime WebRTC calls. LegioX truth lens skill.
---

# OpenAI Realtime Voice Component Guru

## Summary

OpenAI realtime-voice-component is an experimental, Apache-2.0, local-install React/browser reference implementation for tool-constrained UI control over OpenAI Realtime WebRTC. Treat it as a practical integration pattern, not a production-stable UI kit or generic agent framework. The app owns state, validation, permissions, and visible confirmation; the voice runtime only calls narrow Zod-backed tools through a controller. Use auth.sessionEndpoint with a server-proxied /session endpoint that forwards multipart SDP and serialized session config to POST https://api.openai.com/v1/realtime/calls; never expose a standard OpenAI API key in the browser. Prefer outputMode tool-only, server_vad, app-owned wrappers, stable tool definitions, explicit controller ownership, and state sync messages after visible changes. Use the packaged VoiceControlWidget only as a launcher; use the headless controller for custom capture, push-to-talk, richer transcript UI, shared sessions, or route-surviving voice surfaces.

## When to use

- Adding OpenAI Realtime voice control to a React or Next.js application
- Choosing between realtime-voice-component, raw Realtime API, and openai-agents-js
- Designing app-owned voice tools with defineVoiceTool and Zod schemas
- Building a secure /session endpoint for OpenAI Realtime WebRTC calls
- Debugging a VoiceControlWidget that stays idle or fails before /session
- Choosing controller ownership for a single screen, route shell, or shared provider
- Deciding when to use VoiceControlWidget versus a custom controller UI
- Adding ghost cursor visual confirmation for voice-triggered UI changes
- Retrofitting voice into an existing app without duplicating state logic
- Using postToolResponse for multi-step form, wizard, or guided workflows
- Sending current app state back into the Realtime session after visible changes
- Hardening browser voice tools so sensitive policy remains server-side
- Styling or positioning the packaged voice widget
- Testing WebRTC, microphone permission, tool execution, and session proxy failures

## Instructions

1. Secure bootstrap: browser creates SDP offer -> posts multipart SDP plus serialized session config to app /session -> server forwards untouched multipart body to OpenAI Realtime calls endpoint -> browser receives answer SDP.
2. App-owned tools: define one narrow tool per visible action -> validate args with Zod -> execute delegates to an app adapter -> adapter calls existing handlers -> UI performs the real state change.
3. Existing app retrofit: choose controller ownership first -> create a small voice adapter -> register stable tools -> mount widget as launcher -> optionally animate GhostCursorOverlay for confirmation.
4. Single-screen controller: initialize createVoiceControlController with the real tool list immediately -> sync later with controller.configure inside an effect only when options change.
5. Shared-session controller: create a provider-level controller with neutral tools -> active scene reconfigures instructions and tools -> teardown only where the controller was created.
6. Tool-only UI control: set outputMode to tool-only -> keep tools small and specific -> rely on app success state and system state sync rather than assistant chatter.
7. Multi-step workflow: one tool call per field or action -> app-side validation and normalization -> get_missing_state tool when needed -> postToolResponse true to let the model continue.
8. State grounding: after a visible UI change, send a conversation.item.create system message with concise current screen state only when the next model step needs it.
9. Ghost cursor: wrap real app operations with useGhostCursor().run or runEach -> target real DOM elements -> cursor confirms the change but never performs the state mutation itself.
10. Debug order: if idle never hits /session inspect controller ownership, mounting, hydration, media, and WebRTC first; if error before /session inspect client errors and permissions; if /session fails inspect backend proxy, auth, content type, and OpenAI response.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://openai_realtime_voice`).
