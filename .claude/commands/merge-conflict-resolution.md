# Git Merge Conflict Resolution

Think deeply to resolve the merge conflicts present in the git workspace, closely follow the instructions in this file.

## Resolve Git Merge Conflicts by Analyzing Both Sides

When resolving merge conflicts use this strategy:

1. **Identify the conflicted files**
   - examine the actual file contents and git conflict markers to make informed decisions rather than generic suggestions.
2. **Analyze each conflict section** - For each conflict marker (`<<<<<<<`, `=======`, `>>>>>>>`):
   - Examine the "ours" changes (current branch)
   - Examine the "theirs" changes (incoming branch)
   - Determine the original base version if possible
3. **Understand the intent** - Explain what each side was trying to accomplish:
   - What functionality was "ours" trying to add/modify?
   - What functionality was "theirs" trying to add/modify?
   - Use git to view the full commit related to a change for more information.
4. **Propose resolution strategy** - For each conflict:
   - If a merge conflict is due to a dependency lock file like package-lock.json, use the `npm install` or `pnpm install` command to resolve the conflict.
   - Should we keep both changes (merge them)?
   - Should we prioritize one side over the other?
   - Do the changes conflict in logic or just in formatting?
   - Are there any dependencies between the conflicting changes?
   - Does our proposed solution capture the intent of both sides?
   - Does our proposed solution make sense in the context of the other changes in this merge?
   - Does our proposed solution align with the rest of the code base at this point in time?
5. **Provide the resolved code** - Show me the final merged version that preserves the intended functionality from both sides
6. After resolving the conflict, use the `git add` command to stage the changes.
7. DO NOT commit the merge conflict resolution or '--continue' the merge, cherry pick, rebase or other status that moves away from the current state.
9. Generate an overview of the merge conflicts, your analysis of intents and applied resolutions.
10. Run the appropriate build, lint and test commands for ONLY those projects affected by the merge conflict. Fix any problems present keeping in mind the above overview.
