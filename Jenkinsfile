pipeline {

    agent any

    stages {

        stage('Checkout') {

            steps {

                checkout scm

            }

        }


        stage('Create Environment Files') {

            steps {

                sh '''

                echo "======================================"
                echo "Creating Environment Files"
                echo "======================================"

                cat > .env <<EOF
MYSQL_DATABASE=employee_db
MYSQL_USER=appuser
MYSQL_PASSWORD=apppass
MYSQL_ROOT_PASSWORD=rootpass
EOF

                cat > Backend/.env <<EOF
DB_USER=appuser
DB_PASSWORD=apppass
DB_HOST=mysql
DB_NAME=employee_db
EOF

                chmod 600 .env
                chmod 600 Backend/.env

                echo ""
                echo "Checking required MySQL variables..."

                grep '^MYSQL_DATABASE=' .env >/dev/null \
                    && echo "MYSQL_DATABASE: FOUND" \
                    || { echo "MYSQL_DATABASE: MISSING"; exit 1; }

                grep '^MYSQL_USER=' .env >/dev/null \
                    && echo "MYSQL_USER: FOUND" \
                    || { echo "MYSQL_USER: MISSING"; exit 1; }

                grep '^MYSQL_PASSWORD=' .env >/dev/null \
                    && echo "MYSQL_PASSWORD: FOUND" \
                    || { echo "MYSQL_PASSWORD: MISSING"; exit 1; }

                grep '^MYSQL_ROOT_PASSWORD=' .env >/dev/null \
                    && echo "MYSQL_ROOT_PASSWORD: FOUND" \
                    || { echo "MYSQL_ROOT_PASSWORD: MISSING"; exit 1; }

                echo ""
                echo "Checking backend variables..."

                grep '^DB_USER=' Backend/.env >/dev/null \
                    && echo "DB_USER: FOUND" \
                    || { echo "DB_USER: MISSING"; exit 1; }

                grep '^DB_PASSWORD=' Backend/.env >/dev/null \
                    && echo "DB_PASSWORD: FOUND" \
                    || { echo "DB_PASSWORD: MISSING"; exit 1; }

                grep '^DB_HOST=' Backend/.env >/dev/null \
                    && echo "DB_HOST: FOUND" \
                    || { echo "DB_HOST: MISSING"; exit 1; }

                grep '^DB_NAME=' Backend/.env >/dev/null \
                    && echo "DB_NAME: FOUND" \
                    || { echo "DB_NAME: MISSING"; exit 1; }

                echo ""
                echo "Environment files created successfully."

                '''

            }

        }


        stage('Validate Docker Compose') {

            steps {

                sh '''

                echo "======================================"
                echo "Validating Docker Compose"
                echo "======================================"

                docker compose --env-file .env config --quiet

                echo "Docker Compose configuration is valid."

                '''

            }

        }


        stage('Stop Existing Containers') {

            steps {

                sh '''

                echo "======================================"
                echo "Stopping Existing Containers"
                echo "======================================"

                docker compose --env-file .env down || true

                echo "Existing containers stopped."

                '''

            }

        }


        stage('Build Docker Images') {

            steps {

                sh '''

                echo "======================================"
                echo "Building Docker Images"
                echo "======================================"

                docker compose --env-file .env build --no-cache

                echo "Docker images built successfully."

                '''

            }

        }


        stage('Deploy Containers') {

            steps {

                sh '''

                echo "======================================"
                echo "Starting MovieHub"
                echo "======================================"

                docker compose --env-file .env up -d

                echo "Containers started."

                '''

            }

        }


        stage('Wait for Services') {

            steps {

                sh '''

                echo "======================================"
                echo "Waiting for Services"
                echo "======================================"

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

                echo "======================================"
                echo "Verifying MySQL"
                echo "======================================"

                MYSQL_STATUS=$(docker inspect -f '{{.State.Status}}' employee_mysql 2>/dev/null || echo "missing")

                echo "MySQL status: $MYSQL_STATUS"

                if [ "$MYSQL_STATUS" != "running" ]; then

                    echo "ERROR: employee_mysql is not running."

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

                echo "======================================"
                echo "Verifying Database"
                echo "======================================"

                docker exec employee_mysql \
                    mysql -uappuser -papppass employee_db \
                    -e "SHOW TABLES;"

                echo ""
                echo "Database verification completed."

                '''

            }

        }


        stage('Verify Backend') {

            steps {

                sh '''

                echo "======================================"
                echo "Verifying Backend"
                echo "======================================"

                BACKEND_STATUS=$(docker inspect -f '{{.State.Status}}' employee_backend 2>/dev/null || echo "missing")

                echo "Backend status: $BACKEND_STATUS"

                if [ "$BACKEND_STATUS" != "running" ]; then

                    echo "ERROR: employee_backend is not running."

                    docker logs employee_backend --tail 100 || true

                    exit 1

                fi

                echo "Backend container is running."

                echo ""
                echo "Testing Backend API..."

                curl --fail \
                     --retry 5 \
                     --retry-delay 3 \
                     --connect-timeout 5 \
                     --max-time 20 \
                     http://localhost:8000/movies/

                echo ""

                echo "Backend API is responding successfully."

                '''

            }

        }


        stage('Verify Frontend') {

            steps {

                sh '''

                echo "======================================"
                echo "Verifying Frontend"
                echo "======================================"

                FRONTEND_STATUS=$(docker inspect -f '{{.State.Status}}' employee_frontend 2>/dev/null || echo "missing")

                echo "Frontend status: $FRONTEND_STATUS"

                if [ "$FRONTEND_STATUS" != "running" ]; then

                    echo "ERROR: employee_frontend is not running."

                    docker logs employee_frontend --tail 100 || true

                    exit 1

                fi

                echo "Frontend container is running."

                echo ""
                echo "Testing Frontend..."

                curl --fail \
                     --retry 5 \
                     --retry-delay 3 \
                     --connect-timeout 5 \
                     --max-time 20 \
                     http://localhost/

                echo ""

                echo "Frontend is responding successfully."

                '''

            }

        }


        stage('Final Status') {

            steps {

                sh '''

                echo ""
                echo "======================================"
                echo "FINAL DEPLOYMENT STATUS"
                echo "======================================"

                docker compose --env-file .env ps

                echo ""
                echo "===== Running Containers ====="

                docker ps \
                    --filter "name=employee_mysql" \
                    --filter "name=employee_backend" \
                    --filter "name=employee_frontend" \
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

            docker compose --env-file .env ps || true

            '''

            echo "MovieHub deployment failed. Check the logs above."

        }


        always {

            sh '''

            docker image prune -f || true

            '''

        }

    }

}
