workspace {

    model {
        user = person "User" "A couple or individual managing their shared finances."

        coupleCents = softwareSystem "CoupleCents System" "Personal and couple finance tracker application." {
            
            clientContainer = container "Client Container" "The browser runtime handling Next.js Client Components, client-side state, form input validations (via Zod), interactive UI charts (Chart.js), and authentication UI (Better Auth Client)." "React 18, SWR, MUI, Tailwind CSS, Better Auth Client" "Web Browser"
            
            serverContainer = container "Server Container" "The Next.js Node.js server handling Server-Side Rendering (RSC), Server Actions (RPC handlers for data mutations), API Route Handlers (REST endpoints for transaction/locale fetching), Better Auth server-side logic, and database mapping." "Next.js 15, Node.js, Drizzle ORM, Better Auth Server"
            
            database = container "PostgreSQL Database" "Stores relational application data including users, sessions, accounts, encrypted transactions, tags, and settings." "PostgreSQL" "Database"
        }

        googleAuth = softwareSystem "Google OAuth API" "External identity provider for Google social login." "External System"
        githubAuth = softwareSystem "GitHub OAuth API" "External identity provider for GitHub social login." "External System"

        # Relationships
        user -> clientContainer "Interacts with UI components, manages transactions, and views financial dashboards" "HTTPS"
        user -> serverContainer "Requests page URLs to receive initial HTML, JS, and CSS resources" "HTTPS"

        # Client-Side Fetching vs. Server-Side Rendering & Server Actions
        clientContainer -> serverContainer "Retrieves Server-Side Rendered (SSR) page structures and initial state payloads" "HTTPS (GET)"
        clientContainer -> serverContainer "Executes transaction and tag mutations directly using Next.js Server Actions" "HTTPS POST (Next.js RPC)"
        clientContainer -> serverContainer "Fetches dynamic transaction data client-side (via SWR) from REST API Route Handlers" "HTTPS GET (/api/transactions/*)"
        clientContainer -> serverContainer "Delegates authentication, credentials, and session management requests to Better Auth API route" "HTTPS (/api/auth/*)"

        # Server interactions with Database and External APIs
        serverContainer -> database "Queries and updates user profile, transaction records, tags, and settings using Drizzle ORM" "SQL (pg Pool)"
        serverContainer -> googleAuth "Delegates social authentication redirect and token exchange" "HTTPS"
        serverContainer -> githubAuth "Delegates social authentication redirect and token exchange" "HTTPS"
    }

    views {
        container coupleCents "Containers" "Container diagram for the CoupleCents Next.js application." {
            include *
            autolayout lr
        }

        styles {
            element "Element" {
                background #1168bd
                color #ffffff
            }
            element "Person" {
                shape Person
                background #08427b
            }
            element "Database" {
                shape Cylinder
                background #f5da81
                color #000000
            }
            element "Web Browser" {
                shape WebBrowser
            }
            element "External System" {
                background #999999
            }
        }
    }
}
