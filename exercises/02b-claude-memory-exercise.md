# Exercise 02b: Configure Claude Memory for Workshop Context

**Goal:** Use Claude's memory system to store workshop patterns and file organization

**Your task** (3 minutes):

1. **Configure memory**:

   ```
   /memory Using @templates/spec-template.md stores generated specs in @specs/
   ```

2. **Add tech context**:

   ```
   /memory Workshop uses Next.js 15, React 19, TypeScript, and Tailwind CSS
   ```

3. **Validate memory**: Check that Claude retained the information with a simple query

4. **Test behavior**:

   ```
   Create a simple spec and save it appropriately
   ```

**Success criteria:** Claude consistently remembers workshop context and follows file organization patterns
