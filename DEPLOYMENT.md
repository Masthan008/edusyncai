# 🚀 EduSync AI — Deployment & CI/CD Guide with Jenkins

This guide details how to build, deploy, and manage **EduSync AI** in a Dockerized environment on your VPS using a Jenkins CI/CD pipeline, completely isolated from other projects (such as **Mirai-Task**) to prevent port conflicts and naming clashes.

---

## 🏗️ Architecture & Port Mapping

To prevent conflicts with **Mirai-Task** (which occupies ports `9080`, `4000`, and `15432`), **EduSync AI** uses a distinct set of ports on the host system:

| Service | Container Internal Port | Mirai-Task Host Port | EduSync AI Host Port (Default) | Config Variable |
| :--- | :---: | :---: | :---: | :--- |
| **Frontend (Web/Nginx)** | `80` | `9080` | **`3000`** | `FRONTEND_PORT` |
| **Backend (Express API)** | `5000` | `4000` | **`5000`** | `BACKEND_PORT` |
| **Database (PostgreSQL)** | `5432` | `15432` | **`25432`** | `DB_PORT` |

---

## 🔒 Isolation and Project Namespaces

Docker Compose containers, networks, and volumes are isolated using the `COMPOSE_PROJECT_NAME` environment variable. 

* **Mirai-Task Namespace:** `mirai-task`
* **EduSync AI Namespace:** `edusync-ai` (defined in `deploy.sh` and `Jenkinsfile`)

This ensures commands like `$DOCKER_COMPOSE down --remove-orphans` only target containers in the specific namespace, keeping the other services completely untouched and healthy.

---

## 📋 Server Prerequisites

Ensure the following tools are installed on your VPS (e.g. `srv1705207`):

1. **Docker Engine** (v20.10+) & **Docker Compose** (v2.x+)
2. **Jenkins** running on the host or inside a container with access to `/var/run/docker.sock` to execute docker commands.
3. **Git** installed on the server.
4. **Ports Allowed:** Configure your firewall (`ufw` or cloud security groups) to allow traffic on port `3000` (or your customized `FRONTEND_PORT`).

---

## 🛠️ Step-by-Step Jenkins Setup

Follow these steps to configure the pipeline inside your Jenkins dashboard:

### Step 1: Create a New Pipeline Job
1. Open Jenkins and click **New Item** on the left menu.
2. Enter the name: `edusync-ai-pipeline`.
3. Select **Pipeline** and click **OK**.

### Step 2: Configure Build Parameters
Check the box for **This project is parameterized** and add the following two parameters:

1. **String Parameter:**
   * **Name:** `BRANCH`
   * **Default Value:** `main`
   * **Description:** `The Git branch you want to check out and deploy (e.g., main, develop, feature/xyz).`

2. **Choice Parameter:**
   * **Name:** `ACTION`
   * **Choices (one per line):**
     * `deploy`
     * `down`
     * `restart`
     * `logs`
   * **Description:**
     ```
     Choose the action to execute:
     1. deploy  - Pulls the chosen branch, builds and starts Docker containers, runs DB migrations.
     2. down    - Runs docker compose down to stop and remove all containers.
     3. restart - Restarts all services without rebuilding.
     4. logs    - Displays the logs of running containers.
     ```

### Step 3: Define the Pipeline Script
Scroll down to the **Pipeline** section:
* **Definition:** Select **Pipeline script from SCM**.
* **SCM:** Select **Git**.
* **Repository URL:** Enter your git repository path (e.g., `git@github.com:your-username/edusyncai.git` or local file path).
* **Credentials:** Select or create your Git credentials (SSH Key or Username/Password token).
* **Branches to build:** Set the branch specifier to `*/${BRANCH}` (dynamic branch checkout).
* **Script Path:** Set to `Jenkinsfile`.

---

## ⚙️ Setting Up Environment Variables on the Host

The Jenkins pipeline executes `deploy.sh` which copies `.env.example` to `.env` if it does not already exist in the workspace root. 

> [!IMPORTANT]
> To configure API keys and secrets (e.g. `GEMINI_API_KEY`, `JWT_SECRET`), you must set up the `.env` file directly on the VPS in the Jenkins workspace directory or utilize the **Jenkins Credentials Binding** or a **Config File Provider** plugin.

Alternatively, you can manually create and edit the `.env` file in the workspace directory of the Jenkins server:
```bash
# Locate your Jenkins job workspace (usually at /var/lib/jenkins/workspace/edusync-ai-pipeline/)
cd /var/lib/jenkins/workspace/edusync-ai-pipeline/
cp .env.example .env
nano .env
```
Ensure you set:
* `FRONTEND_PORT=3000`
* `BACKEND_PORT=5000`
* `DB_PORT=25432`
* `GEMINI_API_KEY=your_actual_key`
* Unique JWT Secrets.

---

## 🚀 Running the Deployment

1. Click **Build with Parameters** in the Jenkins UI.
2. Select `deploy` under **ACTION** and specify the branch under **BRANCH** (e.g. `main`).
3. Click **Build**.

### Deployment Stages:
1. **Initialize and Checkout:** Jenkins fetches and checks out the selected branch.
2. **Verify Permissions:** The runner executes `chmod +x deploy.sh` to make the deployment script executable.
3. **Execute Action:** 
   * Stops any external docker containers using ports `3000`, `5000`, or `25432`.
   * Pulls the latest base images (`postgres:16-alpine`, `node:20-alpine`, `nginx:alpine`).
   * Builds the backend TypeScript assets and compiles them into the `dist/` directory.
   * Compiles the Vite React application and embeds the production builds in an Nginx reverse proxy image.
   * Starts all containers (`edusync-db`, `edusync-backend`, `edusync-frontend`).
   * Runs the database schema creation and seeder (`dist/database/seeder.js`) inside the backend container.
   * Prunes dangling images to conserve disk space.

---

## 🔍 Troubleshooting & Container Operations

Through the Jenkins interface or direct terminal access, you can run additional actions:

### Check Logs
* Run with parameter `ACTION = logs`.
* Jenkins will output the last 100 lines of logs from all services under the `edusync-ai` namespace.

### Stop Containers
* Run with parameter `ACTION = down`.
* Jenkins will shut down and clean up all resources associated with the `edusync-ai` compose setup.

### Manual Commands (from VPS Terminal)
If you need to log in to the host machine (`srv1705207`) to check status manually:
```bash
# Go to workspace directory
cd /var/lib/jenkins/workspace/edusync-ai-pipeline/

# Check status of containers
docker compose ps

# View live container logs
docker compose logs -f

# Force seed the database manually
docker compose exec -T backend node dist/database/seeder.js
```
