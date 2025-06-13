// Mermaid diagram templates
export interface MermaidTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  category: string;
}

export const mermaidTemplates: MermaidTemplate[] = [
  // Flowchart Templates
  {
    id: "basic-flowchart",
    name: "Basic Flowchart",
    description: "Simple decision flowchart",
    category: "Flowchart",
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`
  },
  {
    id: "process-flowchart",
    name: "Process Flow",
    description: "Business process flowchart",
    category: "Flowchart",
    code: `graph TD
    A[Input] --> B[Process 1]
    B --> C{Validation}
    C -->|Valid| D[Process 2]
    C -->|Invalid| E[Error Handling]
    E --> B
    D --> F[Output]`
  },
  
  // Sequence Diagram Templates
  {
    id: "basic-sequence",
    name: "Basic Sequence",
    description: "Simple sequence diagram",
    category: "Sequence",
    code: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
    A-)B: See you later!`
  },
  {
    id: "api-sequence",
    name: "API Interaction",
    description: "API request/response flow",
    category: "Sequence",
    code: `sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database
    C->>S: POST /api/users
    S->>D: INSERT user
    D-->>S: Success
    S-->>C: 201 Created
    Note over C,D: User registration flow`
  },

  // Class Diagram Templates
  {
    id: "basic-class",
    name: "Basic Class",
    description: "Simple class diagram",
    category: "Class",
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move()
    }
    class Dog {
        +String breed
        +bark()
    }
    Animal <|-- Dog`
  },

  // Gantt Chart Templates
  {
    id: "project-gantt",
    name: "Project Timeline",
    description: "Project management timeline",
    category: "Gantt",
    code: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 30d
    Design         :after a1, 20d
    section Development
    Frontend       :2024-02-01, 45d
    Backend        :2024-02-15, 30d
    section Testing
    Unit Tests     :2024-03-01, 15d
    Integration    :2024-03-10, 10d`
  },

  // Git Graph Templates
  {
    id: "git-flow",
    name: "Git Flow",
    description: "Git branching strategy",
    category: "Git",
    code: `gitgraph
    commit
    branch develop
    checkout develop
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout develop
    merge feature
    checkout main
    merge develop
    commit`
  },

  // State Diagram Templates
  {
    id: "user-states",
    name: "User States",
    description: "User authentication states",
    category: "State",
    code: `stateDiagram-v2
    [*] --> Logged_Out
    Logged_Out --> Logging_In : login()
    Logging_In --> Logged_In : success
    Logging_In --> Logged_Out : failure
    Logged_In --> Logged_Out : logout()
    Logged_In --> Profile : view_profile()
    Profile --> Logged_In : back()`
  },

  // Entity Relationship Templates
  {
    id: "basic-er",
    name: "Database ERD",
    description: "Entity relationship diagram",
    category: "ER",
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }`
  }
];

export const getTemplatesByCategory = () => {
  const categories = [...new Set(mermaidTemplates.map(t => t.category))];
  return categories.reduce((acc, category) => {
    acc[category] = mermaidTemplates.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, MermaidTemplate[]>);
};
