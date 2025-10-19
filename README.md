# Node-RED Study

A Docker-based Node-RED study environment for learning and experimenting with Node-RED flows.

## Features

- Node-RED running in Docker container
- Easy setup with automated scripts
- Data persistence for flows and configurations
- Host file access for integration with local files
- Clean reset capability for starting fresh

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. Clone this repository:
```bash
git clone <repository-url>
cd node-red-study
```

2. Start Node-RED:
```bash
./scripts/start.sh
```

3. Access Node-RED at http://localhost:1880

## Usage

### Start Node-RED
```bash
./scripts/start.sh
```
The script will:
- Create necessary directories (`data`, `hostfiles`)
- Start the Node-RED container
- Display the access URL

### Stop Node-RED
```bash
./scripts/stop.sh
```
This stops the container while preserving all data.

### Reset Everything
```bash
./scripts/reset.sh
```
**Warning**: This will stop the container and delete all flows, settings, and custom nodes. You will be prompted for confirmation.

### View Logs
```bash
cd docker
docker compose logs -f nodered
```

## Directory Structure

```
.
├── docker/
│   ├── docker-compose.yml   # Docker Compose configuration
│   ├── data/                # Node-RED data (flows, settings)
│   └── hostfiles/           # Host files accessible from Node-RED
├── scripts/
│   ├── start.sh            # Start Node-RED
│   ├── stop.sh             # Stop Node-RED
│   └── reset.sh            # Reset and clean all data
├── README.md               # This file
└── LICENSE                 # MIT License
```

## Configuration

The Node-RED container is configured with:
- **Port**: 1880 (Web UI and HTTP nodes)
- **User**: Runs as current user (no permission issues)
- **Timezone**: Asia/Tokyo
- **Projects**: Disabled by default

To modify the configuration, edit `docker/docker-compose.yml`.

## Data Persistence

All Node-RED data is stored in `docker/data/`:
- `flows.json` - Your flow definitions
- `settings.js` - Node-RED settings
- `node_modules/` - Custom nodes installed via npm

The `docker/hostfiles/` directory can be used to share files between your host system and Node-RED.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
