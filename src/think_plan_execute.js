/**
 * The protocol in its vanilla form invokes chain of thought to some level of success. A good thing is that its really reusable and scalable
 * I want to add a layer of 'thinking' and the protocol becomes the execution layer.
 *
 * The hypothesis is that given a task:
 *
 * 1. Understand what it means to achieve the task.
 * 2. Based on the answer from 1, we can come up with a plan of how to attack the task.
 * 3. Based on the steps formulated, we can compare with the tooling available to come up with executions.
 * 4. (Run) We can revisit the plan after each execution step and re-plan.
 * 5. To replan means to identify what change we need to make to the current plan based on a logical reason.
 * 6. Eventually we will reach task completion.
 */

export default async function main() {}
