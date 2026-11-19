# Inhabit art, batch 01: tests

Paste everything below this line into a Claude app chat that has the **custom** Higgsfield
connector (`https://mcp.higgsfield.ai/mcp`, the one with `generate_image`), not the
directory one.

---

You are generating art for a mobile app with the **Higgsfield MCP connector**. Follow these
rules exactly:

0. Use the Higgsfield connector that has `generate_image`, `generate_video`,
   `generate_image_batch`, `generate_video_batch` and `jobs_wait`. If you only see
   balance, models and history tools, you have loaded the wrong one; load the other.
1. Every generation must use the **free-trial unlimited allowance**: pass `use_unlim: true`
   on every `generate_image` and `generate_video` call. If a call says unlimited is not
   available for that model or setting, **skip it and tell me**; never fall back to credits.
2. Do not create a project. Just run the jobs.
3. Run the jobs in parallel where you can (`generate_image_batch` / `generate_video_batch`),
   wait for them with `jobs_wait`, and when everything has finished reply with **one table**:
   `test id | job id | model | status`. I will collect the files myself from the account,
   so do not download or describe the images in detail.
4. Keep the prompts below word for word. Do not improve them.

Reference images already uploaded to this account (use these `media_id`s):

| Name | media_id | What it is |
|---|---|---|
| YOUNG_SHEET | `f311bdc9-dd39-4eb3-8c85-c167a283876f` | young dragon, front and side view |
| YOUNG_FACES | `f26e2437-0360-469f-bd8a-21b262bf78bf` | young dragon, five expressions |
| YOUNG_IDLE | `47a93c1f-e2a5-4a26-b094-8e5a6b5d7a96` | young dragon standing, on green |
| BABY_SHEET | `7cebebcd-ca48-4702-aadc-9d5c3548ef7a` | baby dragon turnaround |
| BABY_IDLE | `d81aeba2-1a2a-4d49-b527-e5c402a4b6bf` | baby dragon standing, on green |

## Shared text

CHARACTER = "The exact same young dragon from the reference images. Keep the identical
character design, colours, soft flat 2D cel shading and proportions: a lean adolescent
dragon with a small head on a long elegant neck, a real snout with a gentle jaw, smaller
almond-shaped dark plum eyes with white highlights, light rosy cheeks, lavender body, pale
mint belly with soft horizontal lines, large mint wings with lavender edges, exactly two
long swept-back warm gold horns plus one small gold nub on top of the head, one row of gold
spikes from the back of the head down the spine to the tip of a long tapering tail, little
gold claws. It stands and walks upright on its two back legs, never on four legs."

POSE_FRONT = "Pose: full body, front view facing the viewer, standing upright on its two
back legs with good posture, arms relaxed at its sides, wings slightly open behind it, a
small friendly closed-mouth smile, both eyes open. The whole dragon fits comfortably inside
the frame with space on every side. No outlines, no text, no shadow on the ground."

GREEN = "Background: one flat solid chroma-key green (#00B140) filling the entire image,
completely even, no gradient, no floor, no scenery."

TRANSPARENT = "Background: fully transparent, nothing behind the dragon at all."

## Images

| Test | Model | Params | Reference(s), role `image_references` | Prompt |
|---|---|---|---|---|
| T1-nb | `nano_banana_pro` | aspect_ratio 1:1, resolution 2k | YOUNG_SHEET, YOUNG_FACES | CHARACTER + POSE_FRONT + GREEN |
| T1-gpt | `gpt_image_2_6` | aspect_ratio 1:1, resolution 2k, quality high, background transparent, output_format png | YOUNG_SHEET, YOUNG_FACES | CHARACTER + POSE_FRONT + TRANSPARENT |
| T1-sd | `seedream_5_5` | aspect_ratio 1:1, resolution 2k, background transparent | YOUNG_SHEET, YOUNG_FACES | CHARACTER + POSE_FRONT + TRANSPARENT |
| T2-gpt-green | `gpt_image_2_6` | aspect_ratio 1:1, resolution 2k, quality high, output_format png | YOUNG_SHEET, YOUNG_FACES | CHARACTER + POSE_FRONT + GREEN |
| T5-nb | `nano_banana_pro` | aspect_ratio 1:1, resolution 2k | YOUNG_IDLE | "Edit the reference image: the exact same young dragon in exactly the same pose, position, size and colours, now wearing a cosy red knitted beanie hat with a white pompom, fitted snugly on its head between its two gold horns, the horns poking out. Change nothing else: same body, same wings, same face, same flat green background filling the whole image. Soft flat 2D cel-shaded style, no outlines, no text." |
| T5-sd | `seedream_5_5` | aspect_ratio 1:1, resolution 2k, background auto | YOUNG_IDLE | same prompt as T5-nb |
| T7-sleep | `nano_banana_pro` | aspect_ratio 1:1, resolution 2k | YOUNG_SHEET, YOUNG_FACES | CHARACTER + " Pose: full body, three-quarter view facing slightly left, fast asleep, lying curled up on its tummy like a sleeping cat, its long neck curved round so its chin rests on its crossed front paws, wings folded neatly on its back, the long tapering tail curled around the front of its body with the tip near its snout. It must look like the lean adolescent in the references, not a round baby: long neck, long horns, slim body. Eyes gently closed as soft curved lines, peaceful content little smile. Low and wide, lying flat on an invisible ground. No Z letters. The whole dragon fits comfortably inside the frame with space on every side." + GREEN |

## Videos

All with `seedance_2_5`, `mode: "omni_reference"`, `generate_audio: false`,
`aspect_ratio: "1:1"`, `bitrate_mode: "standard"`. Pass the same media as both
`start_image` and `end_image` unless the row says otherwise.

LOOP_RULES = "Soft flat 2D cartoon style exactly like the image, same colours and
proportions. The camera is completely locked, no zoom, no pan. The dragon never leaves its
spot or changes size. The background stays one flat solid green the whole time. No new
objects, no text, no shadows. Ends in exactly the starting pose so the clip loops
seamlessly."

| Test | Duration, resolution | start_image | end_image | Prompt |
|---|---|---|---|---|
| T3-720 | 5 s, 720p | YOUNG_IDLE | YOUNG_IDLE | "The young dragon stays standing in exactly the same spot, facing the viewer, and idles naturally like a living creature: slow calm breathing that lifts its chest, one soft blink, a small curious head tilt on its long neck to one side and back, its long tail swishing slowly behind it and its large wings giving a gentle stretch and settle. " + LOOP_RULES |
| T3-1080 | 5 s, 1080p | YOUNG_IDLE | YOUNG_IDLE | same prompt as T3-720 |
| T4-8s | 8 s, 720p | YOUNG_IDLE | YOUNG_IDLE | "The young dragon stays standing in exactly the same spot, facing the viewer, and idles naturally like a living creature: slow calm breathing that lifts its chest, two soft blinks, a small curious head tilt on its long neck to one side and back, then it glances to the other side and back to the viewer, its long tail swishing slowly behind it and its large wings giving a gentle stretch and settle. " + LOOP_RULES |
| T6-grow | 5 s, 720p | BABY_IDLE | YOUNG_IDLE | "The baby dragon stands in the same spot facing the viewer. A warm golden glow rises around it with soft sparkles swirling upward; inside the glow it stretches taller and slimmer, its neck lengthens, its horns grow longer and sweep back, its wings grow larger, and the glow fades to reveal the young dragon standing in exactly the same spot, smiling. Same soft flat 2D cartoon style, same colours. The camera is completely locked, no zoom, no pan. The background stays one flat solid green the whole time. No text, no shadows, no new objects." |

When all eleven jobs have finished, reply with the table from rule 3.
