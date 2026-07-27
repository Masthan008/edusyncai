pipeline {
    agent any

    parameters {
        string(
            name: 'BRANCH',
            defaultValue: 'main',
            description: 'The Git branch you want to check out and deploy (e.g., main, develop, feature/xyz).'
        )
        choice(
            name: 'ACTION',
            choices: ['deploy', 'down', 'restart', 'logs'],
            description: '''Choose the action to execute:
1. deploy  - Pulls the chosen branch, builds and starts Docker containers, runs DB migrations.
2. down    - Runs docker compose down to stop and remove all containers.
3. restart - Restarts all services without rebuilding.
4. logs    - Displays the logs of running containers.'''
        )
    }

    stages {
        stage('Initialize and Checkout') {
            steps {
                script {
                    echo "Checking out and pulling latest changes for branch: ${params.BRANCH}..."
                    // Fetch all remote updates, force checkout the branch, and pull updates.
                    sh """
                        git fetch --all
                        git checkout ${params.BRANCH}
                        git pull origin ${params.BRANCH}
                    """
                }
            }
        }

        stage('Verify Permissions') {
            when {
                anyOf {
                    expression { params.ACTION == 'deploy' }
                }
            }
            steps {
                echo 'Checking deploy script permissions...'
                sh '''
                    if [ -f deploy.sh ]; then
                        chmod +x deploy.sh
                        echo "✅ Granted execution permissions to deploy.sh"
                    else
                        echo "❌ deploy.sh not found!"
                        exit 1
                    fi
                '''
            }
        }

        stage('Execute Action') {
            steps {
                script {
                    // Check docker compose availability
                    def dockerCmd = "docker compose"
                    if (sh(script: "command -v docker-compose >/dev/null 2>&1", returnStatus: true) == 0) {
                        dockerCmd = "docker-compose"
                    }

                    switch(params.ACTION) {
                        case 'deploy':
                            echo '🚀 Executing deploy.sh script...'
                            sh './deploy.sh'
                            break
                            
                        case 'down':
                            echo '🛑 Stopping and removing all Docker containers...'
                            sh "export COMPOSE_PROJECT_NAME=edusync-ai && ${dockerCmd} down --remove-orphans"
                            break

                        case 'restart':
                            echo '🔄 Restarting running Docker containers...'
                            sh "export COMPOSE_PROJECT_NAME=edusync-ai && ${dockerCmd} restart"
                            break

                        case 'logs':
                            echo '📋 Fetching container logs...'
                            sh "export COMPOSE_PROJECT_NAME=edusync-ai && ${dockerCmd} logs --tail=100"
                            break
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Jenkins Pipeline completed successfully!"
        }
        failure {
            echo "❌ Jenkins Pipeline execution failed. Please check the build logs above."
        }
    }
}
