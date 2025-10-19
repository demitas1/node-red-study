# Examples Implementation Plan

## Overview

This document outlines the plan for creating and managing Node-RED flow examples in this repository. The examples will serve as learning materials for various Node-RED concepts and use cases.

## Directory Structure

```
examples/
├── README.md                    # Examples overview and usage instructions
├── basic/
│   ├── 01-hello-world/
│   │   ├── flow.json           # Flow definition
│   │   └── README.md           # Description and instructions
│   ├── 02-simple-timer/
│   │   ├── flow.json
│   │   └── README.md
│   └── 03-debug-output/
│       ├── flow.json
│       └── README.md
├── http/
│   ├── 01-simple-api/
│   │   ├── flow.json
│   │   └── README.md
│   └── 02-rest-client/
│       ├── flow.json
│       └── README.md
├── data-processing/
│   ├── 01-json-transform/
│   │   ├── flow.json
│   │   ├── README.md
│   │   └── sample-data.json    # Sample input data if needed
│   └── 02-csv-parser/
│       ├── flow.json
│       ├── README.md
│       └── sample.csv
└── integration/
    └── 01-file-processing/
        ├── flow.json
        └── README.md
```

## Categories

### 1. Basic
- Hello World flow
- Timer-based flows
- Debug output and logging
- Function node basics
- Template node usage

### 2. HTTP
- Simple HTTP API endpoints
- REST client requests
- Webhook handling
- HTTP authentication
- Query parameter processing

### 3. Data Processing
- JSON transformation
- CSV parsing
- Data filtering and mapping
- Array operations
- String manipulation

### 4. Integration
- File system operations
- External API integration
- Database connections (if needed)
- MQTT messaging
- Email notifications

## Import Method (Option 1: Manual Import)

Users will manually import examples using Node-RED's built-in Import feature. This approach is:
- **Simple**: No additional tools required
- **Flexible**: Users can select specific flows to import
- **Safe**: No automatic modifications to the running environment
- **Educational**: Users learn the standard Node-RED import process

### How to Import

1. Browse the `examples/` directory
2. Open the desired example's `flow.json` file
3. Copy the JSON content
4. In Node-RED UI:
   - Click the hamburger menu (☰) → Import
   - Paste the JSON content
   - Click "Import"
   - Position the flow on the canvas
   - Click "Deploy"

## Example README Template

Each example should include a `README.md` with the following structure:

```markdown
# [Example Name]

## Description
Brief description of what this flow does and its purpose.

## Prerequisites
- List of required custom nodes (if any)
- Required external services or APIs
- Any configuration needed before running

## Nodes Used
- Node type 1 (purpose)
- Node type 2 (purpose)
- Node type 3 (purpose)

## How to Import
1. Copy the contents of `flow.json`
2. In Node-RED, go to Menu → Import
3. Paste the JSON and click Import
4. Deploy the flow

## Configuration
Step-by-step instructions for any required configuration:
1. Double-click the [node name] node
2. Set [property] to [value]
3. Click Done

## Usage
How to trigger and use the flow:
1. [Trigger method]
2. [Where to see output]
3. [Expected behavior]

## Expected Output
Description or example of what the flow produces.

## Learning Points
- Key concept 1: Explanation
- Key concept 2: Explanation
- Key concept 3: Explanation

## Variations
Suggestions for how to modify or extend this flow for learning purposes.
```

## Examples Index (examples/README.md)

The main `examples/README.md` should provide:
- Overview of all available examples
- Quick reference table with categories, difficulty levels
- Links to each example
- General import instructions
- Prerequisites for running examples

### Example Table Format

| Category | Example | Difficulty | Description |
|----------|---------|------------|-------------|
| Basic | 01-hello-world | Beginner | Simple inject and debug flow |
| Basic | 02-simple-timer | Beginner | Periodic message generation |
| HTTP | 01-simple-api | Intermediate | Create a basic REST API |

## Implementation Phases

### Phase 1: Setup
- [ ] Create `examples/` directory structure
- [ ] Create main `examples/README.md`
- [ ] Document import instructions

### Phase 2: Basic Examples
- [ ] 01-hello-world
- [ ] 02-simple-timer
- [ ] 03-debug-output

### Phase 3: HTTP Examples
- [ ] 01-simple-api
- [ ] 02-rest-client

### Phase 4: Data Processing Examples
- [ ] 01-json-transform
- [ ] 02-csv-parser

### Phase 5: Integration Examples
- [ ] 01-file-processing
- [ ] Additional examples as needed

## File Naming Conventions

- **Flow files**: Always named `flow.json`
- **Documentation**: Always named `README.md`
- **Sample data**: Descriptive names (e.g., `sample-data.json`, `test-input.csv`)
- **Directories**: Lowercase with hyphens, numbered for ordering (e.g., `01-hello-world`)

## Best Practices

1. **Keep examples focused**: Each example should demonstrate one concept clearly
2. **Progressive complexity**: Number examples to guide learning progression
3. **Include comments**: Use Comment nodes in flows to explain key points
4. **Test thoroughly**: Ensure all examples work with a fresh Node-RED installation
5. **Document dependencies**: Clearly state any required custom nodes or external services
6. **Provide sample data**: Include test data files where applicable
7. **Use descriptive node names**: Help users understand the flow at a glance

## Quality Checklist

Before adding a new example, ensure:
- [ ] `flow.json` is valid and tested
- [ ] `README.md` follows the template
- [ ] All prerequisites are documented
- [ ] Flow includes comment nodes for clarity
- [ ] Example is listed in `examples/README.md`
- [ ] Node names are descriptive
- [ ] Sample data files are included if needed

## Future Enhancements

Potential future improvements:
- Add difficulty ratings to examples
- Create video walkthroughs for complex examples
- Add automated testing for flows
- Create a web-based catalog viewer
- Add troubleshooting sections to READMEs
- Include performance considerations for larger flows
