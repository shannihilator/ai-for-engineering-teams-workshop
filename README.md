# AI for Engineering Teams Workshop

This is the workshop repository for **AI for Engineering Teams: Practical Tools & Workflows for Modern Development**. Students will build a Customer Intelligence Dashboard using spec-driven development with AI agents.

## Getting Started

### Using VS Code Dev Containers (Recommended)

1. Open this repository in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
3. The dev container will automatically set up the environment with Node.js LTS
4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Local Development (Alternative)

Requires Node.js LTS. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Project Structure

```
├── src/                  # Next.js application source
│   ├── app/             # App Router pages and layouts
│   └── data/            # Mock data and API integration
├── public/              # Static assets
├── exercises/           # Workshop exercises
├── specs/               # Generated specifications (AI output)
└── templates/           # Specification templates
```

## Workshop Methodology

This workshop teaches **spec-driven development** with AI agents:

1. **Write clear specifications** using templates in `/templates/`
2. **Store generated specs** in `/specs/` for reference
3. **Work through exercises** in `/exercises/` directory
4. **Build iteratively** with AI assistance

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Data**: Mock customer data, API Ninjas integration
- **Development**: VS Code Dev Containers, Node LTS

## Workshop Exercises

Complete exercises progressively, each building upon previous skills:

- Exercise 1: Thinking in Specs
- Exercise 2: Platform Context Injection  
- Exercise 3: First AI-Generated Component
- Exercise 4: Incremental Agent Loops
- And more...

## Key Learning Objectives

- Transform ideas into AI-ready specifications
- Implement spec-driven development workflows
- Use AI agents for iterative component development
- Apply security best practices for AI-generated code
- Build production-ready applications with AI assistance

## Support

During the workshop, instructors will guide you through each exercise. Focus on understanding the methodology rather than just completing tasks.
