# BTP Allocation Portal

A web application for managing Bachelor's Thesis Project (BTP) allocations for the EE Department at IIT Indore. The system allows students to submit project preferences, professors to rank students, and administrators to run the allocation algorithm.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **UI Components**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set Up the Database

Initialize the database and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (deletes all data)
npx prisma db push --force-reset

# View database in terminal
npx prisma db pull
```

## Project Structure

```
src/
├── app/
│   ├── (roles)/
│   │   ├── admin/       # Admin dashboard and management
│   │   ├── professor/   # Professor interface
│   │   └── student/     # Student interface
│   ├── api/             # API routes
│   └── login/           # Authentication page
├── components/          # Reusable UI components
├── helper/              # Auth configuration
├── lib/                 # Utilities (Prisma client, etc.)
└── types.ts             # TypeScript interfaces
```

## User Roles

### Admin
- Upload students, professors, and projects via Excel
- Control visibility toggles (who can see what)
- Run the allocation algorithm
- View and export allocation results

### Professor
- View students who selected their projects
- Rank students by preference (drag-and-drop)
- Drop projects if needed
- Submit final preferences

### Student
- View available projects
- Select and rank project preferences
- Form groups with partners
- Submit final preferences

## Default Credentials

After uploading data, users can log in with:
- **Students**: Email from Excel, Password = Roll Number
- **Professors**: Email from Excel, Password = set in Excel
- **Admin**: Configured in the database

## Data Upload Format

### Students Excel
| Column | Description |
|--------|-------------|
| roll_no | Student roll number |
| name | Student name |
| email | Student email |
| cpi | CPI (optional) |

### Professors Excel
| Column | Description |
|--------|-------------|
| name | Professor name |
| email | Professor email |
| password | Login password |

### Projects Excel
| Column | Description |
|--------|-------------|
| Domain | Project domain |
| Project_No | Project number |
| Title | Project title |
| Capacity | Max students |
| Nature_of_work | Type of work |
| Comments | Additional info |
| Supervisor | Professor name |
| Cosupervisor | Co-supervisor (optional) |
| Supervisor_email | Professor email |

## Allocation Flow

1. **Admin** uploads students, professors, and projects
2. **Admin** enables "View Projects" for students
3. **Students** select and rank their project preferences
4. **Admin** enables "Submit Preferences" for students
5. **Students** submit their final preferences
6. **Admin** enables "View Students" for professors
7. **Professors** rank students for each project
8. **Admin** enables "Submit Preferences" for professors
9. **Professors** submit their final rankings
10. **Admin** runs the allocation algorithm
11. **Admin** enables "View Results" for everyone

## Deployment on Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`: For production, use a hosted database (e.g., Turso, PlanetScale)
   - `NEXTAUTH_SECRET`: Generate a secure secret
   - `NEXTAUTH_URL`: Your production URL
4. Deploy

Note: SQLite works locally but for production on Vercel, consider using:
- [Turso](https://turso.tech/) (SQLite-compatible, edge-ready)
- [PlanetScale](https://planetscale.com/) (MySQL)
- [Neon](https://neon.tech/) (PostgreSQL)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

This project is for educational use at IIT Indore.
