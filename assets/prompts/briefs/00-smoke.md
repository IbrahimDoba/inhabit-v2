# Inhabit art, batch 00: does unlimited work?

Paste everything below this line into a claude.ai chat that has the Higgsfield connector.

---

Using the Higgsfield MCP connector, generate exactly one image and nothing else:

- tool: `generate_image`
- model: `nano_banana_pro`
- params: `aspect_ratio: "1:1"`, `resolution: "1k"`, **`use_unlim: true`**
- prompt: "A small friendly lavender cartoon dragon standing on a flat green background, soft flat 2D illustration, no text."

Rules: if the tool says unlimited generations are not available, do not retry on credits;
stop and tell me the exact error message. When it finishes, reply with the job id and
whether it was paid from the unlimited allowance or from credits.
