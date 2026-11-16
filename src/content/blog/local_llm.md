---
title: 'Running LLMs at home: VRAM, KV cache, and whether an eGPU is worth it'
description: 'What I learned trying to run local coding models on a desktop GPU and a Framework laptop, and why I am looking at a USB4 eGPU.'
pubDate: 2026-11-16
tags: ['local-llm', 'hardware', 'egpu']
status: 'in-progress'
---
 
## TL;DR
 
- **VRAM is the whole game.** The model weights have to fit, and so does the KV cache for your context window. The KV cache is the part people forget.
- **A model that's too tight on memory doesn't just run slow, it runs *weird*.** My 9B model got stuck in loops because there was barely room for any context.
- **The GPU driving your monitors pays a "display tax"** on its VRAM.
- **An eGPU over USB4 is better for inference than I expected**, as long as the model fits entirely in the card's VRAM.
## My setup
 
I've been running local models on two machines:
 
| Machine | GPU / memory | Notes |
| --- | --- | --- |
| Desktop | Radeon RX 6800 XT, 16 GB VRAM | Also drives my displays, so only ~10 GB is really usable |
| Framework 13 laptop | Ryzen 7 7840U, 64 GiB RAM | Integrated graphics, shares system RAM |
 
On the software side, I started with `essentialai/rnj-1` through LM Studio, wired into OpenCode as a coding agent. I've since moved to Ornith, and I'm still deciding between Pi and OpenCode as the agent harness.
 
## Lesson 1: The weights are only half the memory budget
 
The rule of thumb everyone learns first: a model needs roughly *parameters × bits per weight ÷ 8* bytes. A 9B model at 4-bit quantization is around 5 GB before any overhead.
 
What I underestimated is the **KV cache**. Every token in the context window stores key and value vectors for every layer, so memory grows linearly with context length:
 
```text
KV cache ≈ 2 × layers × kv_heads × head_dim × bytes_per_value × context_tokens
```
 
The exact number depends on the model's architecture, but on a 10 GB budget, once the weights are loaded, there isn't much left over. Chat can get away with a short context. A **coding agent can't**: the system prompt, tool definitions, and file contents eat thousands of tokens before you've asked anything.
 
## Lesson 2: Starve the KV cache and the model gets weird
 
When I ran Ornith 1.5 9B on the desktop, the context window that fit was small, and the model started **looping**, repeating the same steps or output over and over.
 
My best understanding: with a tiny context, the agent keeps truncating or dropping earlier parts of the conversation. The model loses track of what it already did, so it does it again. It's a capacity problem that looks like a model-quality problem.
 
The fix isn't a better prompt. It's more memory, a smaller model, a more aggressive quantization, or a quantized KV cache (if your runtime supports it), so you can afford a longer context.
 
## Lesson 3: The display tax
 
My 6800 XT has 16 GB, but it's also running my monitors, the desktop compositor, and a browser full of tabs. That costs several gigabytes before a model ever loads. In practice I was working with ~10 GB.
 
If you're building a box mainly for local models, it's worth driving the displays from integrated graphics (or a cheap second card, if those even exist anymore), so the big GPU's VRAM goes entirely to the model.
 
## Lesson 4: Lots of RAM ≠ lots of speed
 
The Framework laptop I am using has 64 GiB of RAM, which sounds great: big models *fit*. The catch is that token generation speed is mostly limited by **memory bandwidth**, because the hardware reads through the weights for every token it generates. Laptop RAM is far slower than a discrete GPU's VRAM, so a model that fits comfortably can still feel sluggish.
 
Fitting the model and running it at a usable speed are separate problems.
 
## Lesson 5: eGPUs are more viable for inference than I assumed
 
I'm looking at adding a **USB4 eGPU with a 24 GB card** to the Framework. My first assumption was that the USB4 link (it carries PCIe at a fraction of a desktop x16 slot's bandwidth) would kill performance. For inference, it mostly doesn't:
 
- **Once the model is loaded into VRAM, very little data crosses the link per token.** Generation happens on the card.
- **Where the link hurts:** loading the model takes longer, and **spilling layers into system RAM** (partial offload) becomes painful, because now every token has to go back and forth over USB4.
So the rule for an eGPU is simple: **pick models that fit entirely in the card's VRAM, KV cache included.** (On the AMD Framework 13, only the rear ports are USB4, so that's where the enclosure goes.)
 
### The two 24 GB cards I'm weighing
 
| | RTX 3090 | Radeon RX 7900 XTX |
| --- | --- | --- |
| VRAM | 24 GB | 24 GB |
| Ecosystem | CUDA, the broadest support across inference tools | ROCm / Vulkan, getting better but some tools are still CUDA-first |
| Buying | Used market only | Newer, still available new |
| Power | ~350 W, needs a strong enclosure PSU | ~355 W, same story |
 
24 GB versus my current ~10 GB usable is the real upgrade. It means I can run a larger model *and* give it enough context to work as a coding agent without looping.
 
## What's next
 
- Settle on Pi vs. OpenCode as the agent harness, and write that comparison up.
## Takeaways
 
1. Budget VRAM for **weights + KV cache + overhead**, not just weights.
2. Agentic coding needs far more context than chat. Plan for it.
3. Looping or forgetful behavior can be a memory problem, not a model problem.
4. Keep your inference GPU off display duty if you can.
