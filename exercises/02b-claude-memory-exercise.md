# Exercise 02b: Configure Claude Memory for Workshop Context

**Goal:** Use Claude's memory system to store workshop patterns and file organization

**Your task** (3 minutes):

1. **Check existing memory**: Ask Claude what it already remembers:
   ```
   What workshop context do you remember?
   ```

2. **Configure memory** (if needed - skip if Claude already knows):
   ```
   /memory Using @templates/spec-template.md stores generated specs in @specs/
   ```

3. **Add tech context** (if needed - skip if Claude already knows):
   ```
   /memory Workshop uses Next.js 15, React 19, TypeScript, and Tailwind CSS
   ```

4. **Validate memory**: Confirm Claude retained the information with a follow-up query

5. **Test behavior**:
   ```
   Create a simple spec and save it appropriately
   ```

6. **Save your progress** (if any changes made):
   ```
   git add -A && git commit -m "chore: configure Claude memory with workshop context"
   ```

**Success criteria:** Claude consistently remembers workshop context and follows file organization patterns