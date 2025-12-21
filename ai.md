This is a Laravel SaaS project

Framework & Style
- Controllers must stay thin (request → service → response)
- Validation must included in forms
- Heavy operations use Jobs & Queues(approval needed)

Architecture Rules
- Do NOT introduce new patterns unless clearly justified
- Reuse existing services instead of duplicating logic
- Prefer batch operations (upsert, bulk insert) over loops
- Avoid updateOrCreate inside loops for performance
- Always try to use shared methods withot going complex

Database & Performance
- Use eager loading to avoid N+1
- Prefer DB-level aggregation where possible


UI & UX
- Frontend uses Shadcn UI with profession design and same patterns across all pages
- Settings should be configurable (not hardcoded)

AI Response Rules
- First, check how similar functionality is already implemented
- Suggest changes that align with existing structure
- If refactoring, explain why and where to place code
- Avoid generic Laravel explanations unless asked
- Always check related files where you are going to make change and its effects
- Changes verification must be you last task

User Roles & Data Access (VERY IMPORTANT)
- There are only TWO roles: Admin and User
- Users are created under an Admin (single-level hierarchy)
- There are NO sub-users under users
- A User must ONLY see and operate on their own records
- An Admin can see and manage ALL records under their account
- All queries must be properly scoped:
  - User → restricted to their own data
  - Admin → allowed global access
- Never suggest queries or logic that expose other users’ data
