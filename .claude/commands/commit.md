# Commit changes in git workspace

Think deeply to commit the changes in this git workspace following the instructions in this file.

Follow these rules when commiting the changes present in the workspace. If some changes are already staged first ask the user if it wants to commit all the changes or only the staged changes, if no changes are already staged just proceed with committing all changes without asking for confirmation. Conclude your process with listing the commit details and final full commit messages used.

## Input Analysis

1.  Review the git branch name and any provided contextual information.
2.  Carefully analyze the provided code diffs.
3.  If the user provided a Jira ticket ID and ticket type it follows here: $ARGUMENTS

## Goal

Ensure the git log is easily understandable, clearly conveying the changes made and the reasoning behind them.

## Task

1.  Logically group related changes
2.  For each group of changes, stage only those changes, then commit with a commit message using the specification below.

## Commit Message Generation

### Structure

Follow the Conventional Commits style.

### General Guidelines

- Start the commit message with the Jira ticket number, if provided or found in the branch name (e.g. ENT-2348 from branch `bugfix/ENT-2348-tests`) and then the appropriate Conventional Commits prefix (e.g., `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`). Leave out the 'scope' unless explicitly specified.
- Separate the subject from the body with a single blank line.

### Subject Line

- **Content**: Summarize changes.
- **Length**: MAX 50 CHARACTERS.
- **Case**: Lowercase.
- **Punctuation**: No period at the end.
- **Mood**: Imperative (e.g., "add feature" not "added feature" or "adds feature").

### Body

- **Purpose**: Explain the problem, why the change was necessary, and how the change addresses the problem.
- **Focus**: On the "what" and "why", not the "how" (the diffs explain the "how").
- **Formatting**: WRAP TEXT AT 72 CHARACTERS.
- **Length**: Max 200 words; shorter is preferred.
- **Paragraphs**: Separate with blank lines.
- **Lists**:
  - Use hyphens (`-`) or asterisks (`*`) for bullet points.
  - Precede bullets with a single space.
  - Separate bullet points with blank lines if they are multi-line.

### Footer

- **Content**: Reference related issues, pull requests, or JIRA tickets.
- **Keywords**: Use keywords like `Closes`, `Fixes`, `Resolves`, `See also`.
- **Examples**:
  - `Closes CMS-1984`
  - `Resolves: #123`
  - `See also: #456, #789`

## Example Commit

ENT-2383 fix(parser): resolve issue with multi-byte character parsing

The previous implementation incorrectly calculated string lengths
when encountering multi-byte UTF-8 characters. This led to
truncation errors and incorrect data processing in downstream
modules.

This commit updates the character counting logic to correctly
handle multi-byte sequences, ensuring accurate string processing
and preventing data corruption.

Resolves: #42
See also: #45, #48

### Formatting commit message with the git CLI

To achieve a commit message with a newlines, for example with list items in the body, you cannot use multiple -m flags as that creates separate paragraphs with blank lines in between.

The most direct way to achieve this from the command line is to pipe the desired string into git commit using the -F - (or --file=-) flag, which tells Git to read the commit message from standard input.

Example using echo and a pipe:
You can use echo -e to interpret backslash escapes like \n for a newline.

`echo -e "This is the subject line\n\nThis is the body:\n- With 1 or more List items\n- Like this" | git commit -F -`

This command constructs the exact multi-line string and pipes it directly to the commit message.

Here is an example of a git commit message that follows the structure, generated using the echo -e and pipe method.

`echo -e "feat: Add user authentication endpoint\n\n- Implement POST /api/v1/auth/login route\n- Add password hashing using bcrypt\n- Include JWT generation upon successful login" | git commit -F -`

Resulting Commit Message:
feat: Add user authentication endpoint

- Implement POST /api/v1/auth/login route
- Add password hashing using bcrypt
- Include JWT generation upon successful login

## Conclusion example

**✅ Commit Successful!**
**Commit Details:**
Hash: 868052d5375
Files Changed: 1 file (8 insertions, 5 deletions)
Pre-commit Hooks: lint-staged ran successfully
Description: Updates tests to align with component requirement that targetElement
is always present as a required input

The changes have been committed with the message:

```text
PM-2385 test: fix image editing actions component tests

Updates tests to align with component requirement that targetElement
is always present as a required input:

- Remove null targetElement handling in test host component
- Fix invalid JSON test by triggering computed signal properly
- Update missing element test to test empty attributes instead
- Ensure all test expectations match component behavior
```

## Output

Generate commits based on the analysis and grouping of changes. Keep in mind a later reader of git log should be able to easily identify the decisions and steps we took to complete the set of changes.
