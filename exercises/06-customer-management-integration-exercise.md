# Exercise 06: Customer Management Integration

**Goal:** Build complete customer management with multi-layer orchestration, building upon previous exercises

<v-clicks>

## Building Upon Previous Work

**What we have so far:**

- ✅ **CustomerCard component** (Exercise 03) with health score visualization
- ✅ **CustomerSelector component** (Exercise 04) with search and selection
- ✅ **Enhanced CustomerCard** (Exercise 05) with click handling and selection state
- ✅ **Mock customer data** in `@app/src/data/mock-customers.ts` with 8 customers

**What we're adding:** Full customer management (Create, Read, Update, Delete) with API integration

</v-clicks>

---

# Exercise 06: Ask Claude to Plan Multi-Step Integration

**Learning Goal:** Learn to orchestrate Claude through complex, multi-file features

<v-clicks>

**Step 1:** Ask Claude to create specialized agents for this integration:

```markdown
I need to build customer management (CRUD operations) that builds upon:
- Existing CustomerCard component from previous exercises
- Mock customer data in @app/src/data/mock-customers.ts
- Customer interface already defined

This integration requires multiple specialized agents. Please create and configure these agents for me:

1. API specialist - for Next.js Route Handlers with security validation
2. Service layer specialist - for CustomerService abstraction
3. UI specialist - for React components that integrate with existing CustomerCard
4. Security reviewer - for reviewing API code

After creating these agents, provide a step-by-step orchestration plan.
```

**Step 2:** Let Claude create the specialized agents and plan their orchestration

</v-clicks>

---

# Exercise 06: Claude-Orchestrated Development

**Follow Claude's orchestration plan:**

<v-clicks>

**Step 3:** Ask Claude to generate the spec:

```markdown
Using @templates/spec-template.md and the existing customer data structure, 
create a comprehensive spec for customer management integration.
Focus on CRUD operations that work with our existing CustomerCard component.
```

**Step 4:** Ask Claude to orchestrate the service layer:

```markdown
Based on the spec above, use your service-layer specialist agent to create CustomerService:

Build upon the existing mock-customers.ts structure.
Include CRUD operations for the Customer interface.
File: app/src/services/CustomerService.ts

Use your service-layer specialist to ensure proper abstraction patterns.
```

</v-clicks>

---

# Exercise 06: Continue Claude Orchestration

**Let Claude manage the development workflow:**

<v-clicks>

**Step 5:** Ask Claude to orchestrate the API specialist:

```markdown
Context: CustomerService is complete with CRUD operations.
Next: Use your API specialist agent to create secure API routes that use the CustomerService.

Have the API specialist build:
- POST /api/customers (create)
- GET /api/customers (list all) 
- GET /api/customers/[id] (get single)
- PUT /api/customers/[id] (update)
- DELETE /api/customers/[id] (delete)

Ensure the API specialist includes proper input validation and HTTP status codes.
```

**Step 6:** Ask Claude to orchestrate the security reviewer:

```markdown
Now use your security reviewer agent to review the API routes above.
Have the security reviewer check for:
- Injection attacks and input validation
- Data sanitization issues  
- SSRF vulnerabilities
- Proper error handling
```

</v-clicks>

---

# Exercise 06: UI Integration with Claude

**Complete the integration through Claude:**

<v-clicks>

**Step 7:** Ask Claude to orchestrate the UI specialist:

```markdown
Context: Secure API routes are complete and reviewed by security specialist.
Final step: Use your UI specialist agent to create components that integrate with existing CustomerCard.

Have the UI specialist build:
1. AddCustomerForm - Create new customers with validation
2. CustomerList - Display customers using existing CustomerCard

Ensure the UI specialist places components in app/src/components/ folder and follows React 19 + Tailwind patterns.
```

**Step 8:** Ask Claude to orchestrate integration testing:

```markdown
Now coordinate all your agents to verify the complete customer management workflow:
- Have agents test API endpoints with example requests
- Ensure new customers appear in CustomerList  
- Confirm integration with existing CustomerCard selection
- Provide a comprehensive testing checklist from all specialists
```

</v-clicks>

---

# Exercise 06: What You Learned

<v-clicks>

**Specialized Agent Orchestration Skills:**

- **Agent Creation Requests** - Asking Claude to create and configure specialized agents
- **Agent Orchestration** - Having Claude coordinate multiple agents through workflows
- **Context Management** - Providing context from previous agents to maintain workflow continuity
- **Security Integration** - Using specialized security reviewer agents through Claude
- **Multi-Agent Coordination** - Guiding Claude to orchestrate API, service, UI, and security specialists

</v-clicks>

<v-click>

**Key Takeaway:** You can ask Claude to create specialized agents and then orchestrate them through complex development workflows - getting the benefits of specialization while maintaining Claude's coordination

</v-click>

---

# Save your progress

Commit your changes:

Then commit your changes:
```
git add -A && git commit -m "feat: integrate customer management with full CRUD operations"
```
