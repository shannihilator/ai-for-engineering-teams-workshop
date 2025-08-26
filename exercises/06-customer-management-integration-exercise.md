# Exercise 06: Agent Setup Instructions

**Before starting:** Define specialized agents for coordinated development.

<v-clicks>

## How to Set Up Agents (Step-by-Step):

1. **Open Claude Code** and create a new agent by typing:
   ```
   /agent create api-agent
   ```

2. **Configure each agent** with specific context and role:

**API Agent Setup:**
```
/agent create api-agent
Context: "@requirements/customer-management-integration.md API Layer section"
Role: "You are an API route specialist focusing on Next.js Route Handlers and security. Create secure CRUD endpoints with proper validation."
```

</v-clicks>

---

# Exercise 06: More Agent Setup

<v-clicks>

**Security Agent Setup:**
```
/agent create security-agent  
Context: "@requirements/customer-management-integration.md Security Requirements"
Role: "You are a security reviewer specializing in input validation and injection prevention. Review all API code for vulnerabilities."
```

**Service Agent Setup:**
```
/agent create service-agent
Context: "@requirements/customer-management-integration.md Service Layer"
Role: "You are a service layer specialist for CustomerService and data abstraction. Create clean business logic separation."
```

**UI Agent Setup:**
```
/agent create ui-agent
Context: "@requirements/customer-management-integration.md UI Components"  
Role: "You are a React component specialist for forms and customer display. Build user-friendly interfaces with validation."
```

</v-clicks>

---

# Exercise 06: Final Agent Setup

<v-clicks>

**Test Agent Setup:**
```
/agent create test-agent
Context: "Full customer management requirements for end-to-end testing"
Role: "You are an integration testing specialist for API-to-UI workflows. Create comprehensive test coverage."
```

## Agent Summary:
- **API Agent**: Secure CRUD routes + validation
- **Security Agent**: Vulnerability analysis  
- **Service Agent**: Business logic + data abstraction
- **UI Agent**: React forms + customer display
- **Test Agent**: End-to-end verification

</v-clicks>

---

# Exercise 06: Multi-Step Customer Management Integration

**Goal:** Build complete customer management with orchestrated AI subagents

<v-clicks>

**Task** (30 minutes):

1. **Generate spec** (5 min): Launch subagent with @templates/spec-template.md + @requirements/customer-management-integration.md

2. **Validate** (5 min): Review for CRUD ops, security, layer separation

3. **Orchestrated build** (20 min): Prompt Claude:
   
   *"Using @specs/customer-management-integration-spec.md and the defined agents above, implement complete customer management. Show orchestration plan, then launch subagents:*
   - *API Agent: Secure CRUD routes + validation*  
   - *Security Agent: Vulnerability analysis of API routes*
   - *Service Agent: CustomerService + storage abstraction*
   - *UI Agent: AddCustomerForm + CustomerList components*
   - *Test Agent: End-to-end verification and integration testing"*

</v-clicks>

---

# Exercise 06: Key Learning Points

<v-clicks>

**Learning:**
- **Orchestration visibility**: See Claude's execution plan and real-time subagent progress
- **Parallel execution**: Launch multiple subagents simultaneously where possible
- **Automated quality gates**: Security review as automated quality check
- **Context coordination**: How Claude coordinates between subagents automatically
- **Service layer abstraction**: Clean separation between API, service, and UI layers

</v-clicks>

<v-click>

**Success:** Working add/list system with secure API and form validation

</v-click>