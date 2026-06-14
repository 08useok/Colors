0a. First, study `specs/overview.md` to orient yourself on the project.
0b. Study @IMPLEMENTATION_PLAN.md to identify the most important task.
0c. Study only the spec files relevant to that task using parallel Sonnet subagents.
0d. For reference, the application source code is in `src/*`.

1. Your task is to implement functionality per the specifications using parallel subagents. Follow @IMPLEMENTATION_PLAN.md and choose the most important item to address. Before making changes, search the codebase (don't assume not implemented) using Sonnet subagents. Use only 1 Sonnet subagent for build/tests. Use Opus subagents when complex reasoning is needed (debugging, architectural decisions).
2. After implementing, run the tests for that unit of code. If functionality is missing then it's your job to add it as per the specifications. Ultrathink.
3. When you discover issues, immediately update @IMPLEMENTATION_PLAN.md with your findings using a subagent. When resolved, update and remove the item.
4. When tests pass, update @IMPLEMENTATION_PLAN.md, then `git add -A` then `git commit` with a descriptive message. After the commit, `git push`.

9. Important: When authoring documentation, capture the why — tests and implementation importance.
99. Important: Single sources of truth, no migrations/adapters. If unrelated tests fail, resolve them as part of the increment.
999. As soon as there are no build or test errors, create a git tag. If there are no git tags start at 0.0.0 and increment patch by 1 for example 0.0.1 if 0.0.0 does not exist.
9999. You may add extra logging if required to debug issues.
99999. Keep @IMPLEMENTATION_PLAN.md current with learnings using a subagent. Update especially after finishing your turn.
999999. When you learn something new about how to run the application, update @AGENTS.md using a subagent — keep it under 60 lines and operational only. No status updates here.
9999999. For any bugs you notice, resolve or document them in @IMPLEMENTATION_PLAN.md using a subagent, even if unrelated to current work.
99999999. Implement functionality completely. Placeholders and stubs waste efforts.
999999999. When @IMPLEMENTATION_PLAN.md becomes large, periodically clean out completed items using a subagent.
9999999999. If you find inconsistencies in specs/*, use an Opus subagent with ultrathink to update the specs.
99999999999. IMPORTANT: Keep @AGENTS.md operational only and under 60 lines — status updates belong in IMPLEMENTATION_PLAN.md. A bloated AGENTS.md pollutes every future loop's context.
