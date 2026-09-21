pipeline {

    agent any

    environment {

        PROJECT_DIR = "/home/ubuntu/MovieHub-Movie-Ticket-Booking-System"

    }

    stages {

        stage('Checkout') {

            steps {

                checkout scm

            }

        }

        stage('Copy Project') {

            steps {

                sh '''

                sudo mkdir -p "$PROJECT_DIR"

                sudo chmod 755 /home/ubuntu

                sudo rsync -av --delete \\
                    --exclude='.git' \\
                    "$WORKSPACE"/ "$PROJECT_DIR"/

                sudo chown -R jenkins:jenkins "$PROJECT_DIR"

                echo "Project copied successfully"

                ls -la "$PROJECT_DIR"

                '''

            }

        }

        stage('Create Environment Files') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo "Creating root .env file..."

                cat > .env <<EOF
MYSQL_DATABASE=employee_db
MYSQL_USER=appuser
MYSQL_PASSWORD=apppass
MYSQL_ROOT_PASSWORD=rootpass
EOF

                echo "Creating Backend/.env file..."

                cat > Backend/.env <<EOF
DB_USER=appuser
DB_PASSWORD=apppass
DB_HOST=mysql
DB_NAME=employee_db
EOF

                chmod 600 .env
                chmod 600 Backend/.env

                echo "Environment files created successfully"

                echo ""
                echo "Checking root .env variables..."

                grep '^MYSQL_DATABASE=' .env \
                    && echo "MYSQL_DATABASE: FOUND"

                grep '^MYSQL_USER=' .env \
                    && echo "MYSQL_USER: FOUND"

                grep '^MYSQL_PASSWORD=' .env \
                    && echo "MYSQL_PASSWORD: FOUND"

                grep '^MYSQL_ROOT_PASSWORD=' .env \
                    && echo "MYSQL_ROOT_PASSWORD: FOUND"

                echo ""
                echo "Checking Backend/.env variables..."

                grep '^DB_USER=' Backend/.env \
                    && echo "DB_USER: FOUND"

                grep '^DB_PASSWORD=' Backend/.env \
                    && echo "DB_PASSWORD: FOUND"

                grep '^DB_HOST=' Backend/.env \
                    && echo "DB_HOST: FOUND"

                grep '^DB_NAME=' Backend/.env \
                    && echo "DB_NAME: FOUND"

                '''

            }

        }

        stage('Validate Docker Compose') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo "Validating Docker Compose configuration..."

                docker compose --env-file .env config --quiet

                echo "Docker Compose configuration is valid."

                '''

            }

        }

        stage('Stop Containers & Cleanup') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo "Stopping existing containers..."

                docker compose --env-file .env down || true

                echo "Cleaning unused Docker resources..."

                docker system prune -af || true

                '''

            }

        }

        stage('Build Docker Images') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo "Building Docker images..."

                docker compose --env-file .env build --no-cache

                '''

            }

        }

        stage('Deploy Containers') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo "Starting MovieHub containers..."

                docker compose --env-file .env up -d

                '''

            }

        }

        stage('Wait for Services') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo "Waiting for MySQL and backend services..."

                sleep 20

                echo ""
                echo "===== Docker Compose Status ====="

                docker compose --env-file .env ps

                '''

            }

        }

        stage('Verify MySQL') {

            steps {

                sh '''

                echo "Checking MySQL container..."

                MYSQL_STATUS=$(docker inspect -f '{{.State.Status}}' employee_mysql 2>/dev/null || echo "missing")

                echo "MySQL status: $MYSQL_STATUS"

                if [ "$MYSQL_STATUS" != "running" ]; then

                    echo "ERROR: MySQL container is not running."

                    docker logs employee_mysql --tail 100 || true

                    exit 1

                fi

                echo "MySQL is running successfully."

                '''

            }

        }

        stage('Verify Database') {

            steps {

                sh '''

                echo "Checking database tables..."

                docker exec employee_mysql \\
                    mysql -uappuser -papppass employee_db \\
                    -e "SHOW TABLES;"

                echo "Database verification completed."

                '''

            }

        }

        stage('Verify Backend') {

            steps {

                sh '''

                echo "Checking backend container..."

                BACKEND_STATUS=$(docker inspect -f '{{.State.Status}}' employee_backend 2>/dev/null || echo "missing")

                echo "Backend status: $BACKEND_STATUS"

                if [ "$BACKEND_STATUS" != "running" ]; then

                    echo "ERROR: Backend container is not running."

                    docker logs employee_backend --tail 100 || true

                    exit 1

                fi

                echo "Backend container is running."

                echo ""
                echo "Testing Backend API..."

                curl --fail \\
                     --retry 5 \\
                     --retry-delay 3 \\
                     --connect-timeout 5 \\
                     --max-time 20 \\
                     http://localhost:8000/movies/

                echo ""

                echo "Backend API is responding successfully."

                '''

            }

        }

        stage('Verify Frontend') {

            steps {

                sh '''

                echo "Checking frontend container..."

                FRONTEND_STATUS=$(docker inspect -f '{{.State.Status}}' employee_frontend 2>/dev/null || echo "missing")

                echo "Frontend status: $FRONTEND_STATUS"

                if [ "$FRONTEND_STATUS" != "running" ]; then

                    echo "ERROR: Frontend container is not running."

                    docker logs employee_frontend --tail 100 || true

                    exit 1

                fi

                echo "Frontend container is running."

                echo ""
                echo "Testing frontend..."

                curl --fail \\
                     --retry 5 \\
                     --retry-delay 3 \\
                     --connect-timeout 5 \\
                     --max-time 20 \\
                     http://localhost/

                echo ""

                echo "Frontend is responding successfully."

                '''

            }

        }

        stage('Final Status') {

            steps {

                sh '''

                cd "$PROJECT_DIR"

                echo ""
                echo "======================================"
                echo "FINAL DEPLOYMENT STATUS"
                echo "======================================"

                docker compose --env-file .env ps

                echo ""
                echo "===== Running Containers ====="

                docker ps \\
                    --filter "name=employee_mysql" \\
                    --filter "name=employee_backend" \\
                    --filter "name=employee_frontend" \\
                    --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

                '''

            }

        }

    }

    post {

        success {

            echo ""
            echo "======================================"
            echo "SUCCESS"
            echo "======================================"
            echo "MovieHub Movie Ticket Booking System deployed successfully!"

        }

        failure {

            sh '''

            echo ""
            echo "======================================"
            echo "DEPLOYMENT FAILED"
            echo "======================================"

            echo ""
            echo "===== MySQL Logs ====="

            docker logs employee_mysql --tail 100 2>&1 || true

            echo ""
            echo "===== Backend Logs ====="

            docker logs employee_backend --tail 100 2>&1 || true

            echo ""
            echo "===== Frontend Logs ====="

            docker logs employee_frontend --tail 50 2>&1 || true

            echo ""
            echo "===== Docker Compose Status ====="

            cd "$PROJECT_DIR"

            docker compose --env-file .env ps || true

            '''

            echo "FAILED: MovieHub deployment failed. Check Jenkins console output."

        }

        always {

            sh '''

            sudo chown -R ubuntu:ubuntu "$PROJECT_DIR" || true

            docker image prune -f || true

            '''

        }

    }

}
