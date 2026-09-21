pipeline {
    agent any

    stages {

        stage('Create Environment Files') {
            steps {
                withCredentials([
                    string(credentialsId: 'app-env', variable: 'APP_ENV'),
                    string(credentialsId: 'backend-env', variable: 'BACKEND_ENV')
                ]) {
                    sh '''
                        printf '%s\\n' "$APP_ENV" > .env
                        printf '%s\\n' "$BACKEND_ENV" > Backend/.env

                        chmod 600 .env
                        chmod 600 Backend/.env
                    '''
                }
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh '''
                    docker compose --env-file .env down || true

                    docker stop employee_mysql employee_backend employee_frontend 2>/dev/null || true
                    docker rm employee_mysql employee_backend employee_frontend 2>/dev/null || true
                '''
            }
        }

        stage('Build and Start') {
            steps {
                sh '''
                    docker compose --env-file .env up -d --build
                '''
            }
        }

        stage('Wait for Services') {
            steps {
                sh '''
                    echo "Waiting for MySQL and backend..."

                    sleep 10

                    docker compose --env-file .env ps

                    echo "Checking backend container..."

                    if ! docker ps --format '{{.Names}}' | grep -q '^employee_backend$'; then
                        echo "ERROR: employee_backend is not running"
                        docker logs employee_backend --tail 100 || true
                        exit 1
                    fi

                    echo "Backend container is running."
                '''
            }
        }

        stage('Verify Backend API') {
            steps {
                sh '''
                    echo "Testing backend API..."

                    curl --fail --retry 5 --retry-delay 3 \
                        http://localhost:8000/movies/

                    echo ""
                    echo "Backend API is responding successfully."
                '''
            }
        }

        stage('Verify Database Tables') {
            steps {
                sh '''
                    echo "Checking database tables..."

                    docker exec employee_mysql \
                        mysql -uappuser -papppass employee_db \
                        -e "SHOW TABLES;"

                    echo "Database verification completed."
                '''
            }
        }

        stage('Final Status') {
            steps {
                sh '''
                    docker compose --env-file .env ps
                '''
            }
        }
    }

    post {
        failure {
            sh '''
                echo "Deployment failed. Showing backend logs..."
                docker logs employee_backend --tail 100 || true

                echo "Showing MySQL logs..."
                docker logs employee_mysql --tail 50 || true
            '''
        }

        success {
            echo 'MovieHub deployment completed successfully.'
        }
    }
}
