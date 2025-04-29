/**
 * RUNNING MEMORY
 *
 * I'm experimenting how I can improve how LLMs use experience. I think the gap stems from an issue of memory retrieval.
 * This problem is hard to reproduce though, when it comes to short term memory llms are actually good as is. The LLM has context of previous
 * conversations and can recall properly. To some extent you can see it also can extract information from past expriences.
 *
 * The gap starts becoming obvious when it needs to layer information from different time periods and finding connections between layers of memory.
 *
 * A sample scneario, is when you give it a file, it needs to reference conversations and files from history to be able to give you a high level briefing of what is happening.
 * This is opposed to today, where when you ask for summary of a file and you actually read the file, you don't get anything new.
 * I'll  try to build this scenario at different levels of complexity to get the maximum out of it.
 *
 * NEXT STEPS
 * 1. Prepare this scenario (Produce files and a mock project with personel, based on real timestamps, with a high level theme) (I need an intern)
 * 2. Build a proper retrieval system that is driven by the assistant.
 */

export default async function main() {}
