# Exercise 07: Market Intelligence Widget Composition

**Goal:** Build a market intelligence widget using spec-driven context compression

**Your task** (15 minutes):

1. **Generate spec**: 
   ```
   Write a MarketIntelligenceWidget spec using @templates/spec-template.md and @requirements/market-intelligence.md
   ```

2. **Review spec**: Ensure it covers API, service layer, and UI integration points

3. **Implement API**: 
   ```
   Implement the market intelligence API route at /api/market-intelligence/[company] following the spec requirements. Use @data/mock-market-intelligence.ts for data generation.
   ```

4. **Create service**: 
   ```
   Implement MarketIntelligenceService with caching as specified in the spec. Follow the patterns from existing services.
   ```

---

# Exercise 07: Market Intelligence Widget Composition (continued)

5. **Build widget**: 
   ```
   Create MarketIntelligenceWidget component following the spec. Match existing widget patterns from CustomerCard and DomainHealthWidget.
   ```

6. **Integrate dashboard**: 
   ```
   Integrate the MarketIntelligenceWidget into the main dashboard alongside existing widgets. Follow the spec guidelines for composition.
   ```

7. **Test data flow**: 
   ```
   Create test pages to verify the complete market intelligence data flow from API to dashboard display.
   ```

**Success criteria:** Working dashboard with cohesive, spec-driven integrated widgets

## Save your progress

```
git add -A && git commit -m "feat: compose market intelligence widget with multi-agent output"
```