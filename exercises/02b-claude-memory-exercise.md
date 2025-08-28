# Exercise 02b: Configure Claude Memory for Workshop Context

**Goal:** Use Claude's memory system to store workshop patterns and file organization

**Your task** (3 minutes):

1. **Check existing memory**: Ask Claude what workshop context it remembers
   * **Configure memory** (if needed):
   ```
   /memory Using @templates/spec-template.md stores generated specs in @specs/
   /memory Workshop uses Next.js 15, React 19, TypeScript, and Tailwind CSS
   ```

2. **Test behavior**:
   ```
   Create a simple spec and save it appropriately
   ```

3. **Save your progress** (if any changes made):
   ```
   git add -A && git commit -m "chore: configure Claude memory with workshop context"
   ```

**Success criteria:** Claude remembers workshop context and follows file patterns