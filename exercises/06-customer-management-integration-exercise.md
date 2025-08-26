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

# Exercise 06: Agent Setup - You Do It

**Learning Goal:** Practice setting up specialized agents for coordinated development

<v-clicks>

**Step 1:** Create your first agent (API specialist):

```bash
# In Claude Code, create an API-focused agent
/agent create api-specialist

# Configure it with this context:
"You are an API route specialist. Focus on Next.js App Router Route Handlers.
Build secure CRUD endpoints that work with existing Customer interface from @app/src/data/mock-customers.ts.
Always include input validation and proper HTTP status codes."
```

**Step 2:** Create a service layer agent:

```bash
/agent create service-agent

# Configure with:
"You are a service layer specialist. Create CustomerService classes that abstract data operations.
Build upon existing mock-customers.ts data structure. Focus on clean business logic separation."
```

</v-clicks>

---

# Exercise 06: Complete Agent Setup

**Continue setting up your agent team:**

<v-clicks>

**Step 3:** Create UI component agent:

```bash
/agent create ui-specialist

# Configure with:
"You are a React component specialist. Build forms and customer display components.
Create components that integrate with existing CustomerCard from previous exercises.
Focus on user-friendly interfaces with validation feedback."
```

**Step 4:** Create security review agent:

```bash
/agent create security-reviewer

# Configure with:
"You are a security specialist. Review API code for vulnerabilities like injection attacks.
Focus on input validation, sanitization, and secure data handling practices."
```

</v-clicks>

---

# Exercise 06: Orchestrating Your Agents

**Now put your agents to work:**

<v-clicks>

**Step 5:** Generate the spec with main Claude:

```
Write a CustomerManagement spec using @templates/spec-template.md and @requirements/customer-management-integration.md. Focus on building upon existing CustomerCard component and mock-customers.ts data structure.
```

**Step 6:** Launch your service agent:

```
@service-agent: Using the spec above, create a CustomerService class in app/src/services/CustomerService.ts. Extend the existing mock-customers.ts data as your starting point. Include CRUD operations for the Customer interface.
```

</v-clicks>

---

# Exercise 06: Continue the Chain

**Keep orchestrating your specialized agents:**

<v-clicks>

**Step 7:** Launch your API agent:

```
@api-specialist: Create secure API routes for customer CRUD operations:
- POST /api/customers (create new customer)
- GET /api/customers (list all customers)
- GET /api/customers/[id] (get single customer)
- PUT /api/customers/[id] (update customer)
- DELETE /api/customers/[id] (delete customer)

Use the CustomerService from previous step. Include input validation.
```

**Step 8:** Security review:

```
@security-reviewer: Review the API routes above for security vulnerabilities. Check for injection attacks, input validation, and data sanitization issues.
```

</v-clicks>

---

# Exercise 06: Complete with UI Agent

**Final agent orchestration:**

<v-clicks>

**Step 9:** Build the UI components:

```
@ui-specialist: Create two components that work with existing CustomerCard:

1. AddCustomerForm component:
   - Form to create new customers
   - Validation with error display
   - Submit calls API to create customer

2. CustomerList component:
   - Displays customers using existing CustomerCard component
   - Fetches data from API
   - Shows customer count and allows refresh

Place in app/src/components/ folder.
```

**Step 10:** Test the complete workflow:

- Add new customer through form → Should appear in CustomerList → Should work with existing CustomerCard selection

</v-clicks>

---

# Exercise 06: What You Learned

<v-clicks>

**Agent Orchestration Skills:**

- **Agent Creation** - Setting up specialized agents with focused expertise
- **Context Handoffs** - Passing information between agents in a coordinated workflow
- **Agent Specialization** - Creating agents that focus on specific technical domains
- **Security Integration** - Using dedicated security agents as quality gates
- **Progressive Building** - Each agent builds upon previous agent outputs

</v-clicks>

<v-click>

**Key Takeaway:** You can create your own AI development team by setting up specialized agents and orchestrating their work

</v-click>
