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
                        echo "======================================"
                        echo "Creating environment files"
                        echo "======================================"

                        echo "APP_ENV length: ${#APP_ENV}"
                        echo "BACKEND_ENV length: ${#BACKEND_ENV}"

                        echo ""
                        echo "Checking APP_ENV variables..."

                        printf '%s\\n' "$APP_ENV" | grep '^MYSQL_DATABASE=' \
                            >/dev/null \
                            && echo "MYSQL_DATABASE: FOUND" \
                            || echo "MYSQL_DATABASE: MISSING"

                        printf '%s\\n' "$APP_ENV" | grep '^MYSQL_USER=' \
                            >/dev/null \
                            && echo "MYSQL_USER: FOUND" \
                            || echo "MYSQL_USER: MISSING"

                        printf '%s\\n' "$APP_ENV" | grep '^MYSQL_PASSWORD=' \
                            >/dev/null \
                            && echo "MYSQL_PASSWORD: FOUND" \
                            || echo "MYSQL_PASSWORD: MISSING"

                        printf '%s\\n' "$APP_ENV" | grep '^MYSQL_ROOT_PASSWORD=' \
                            >/dev/null \
                            && echo "MYSQL_ROOT_PASSWORD: FOUND" \
                            || echo "MYSQL_ROOT_PASSWORD: MISSING"

                        echo ""
                        echo "Creating .env files..."

                        printf '%s\\n' "$APP_ENV" > .env
                        printf '%s\\n' "$BACKEND_ENV" > Backend/.env

                        chmod 600 .env
                        chmod 600 Backend/.env

                        echo ""
                        echo "Checking generated .env..."

                        grep '^MYSQL_DATABASE=' .env \
                            >/dev/null \
                            && echo "MYSQL_DATABASE in .env: FOUND" \
                            || echo "MYSQL_DATABASE in .env: MISSING"

                        grep '^MYSQL_USER=' .env \
                            >/dev/null \
                            && echo "MYSQL_USER in .env: FOUND" \
                            || echo "MYSQL_USER in .env: MISSING"

                        grep '^MYSQL_PASSWORD=' .env \
                            >/dev/null \
                            && echo "MYSQL_PASSWORD in .env: FOUND" \
                            || echo "MYSQL_PASSWORD in .env: MISSING"

                        grep '^MYSQL_ROOT_PASSWORD=' .env \
                            >/dev/null \
                            && echo "MYSQL_ROOT_PASSWORD in .env: FOUND" \
                            || echo "MYSQL_ROOT_PASSWORD in .env: MISSING"

                        echo ""
                        echo "Environment files created."
                    '''
                }
            }
        }


        stage('Validate Environment') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Validating environment"
                    echo "======================================"

                    for var in MYSQL_DATABASE MYSQL_USER MYSQL_PASSWORD MYSQL_ROOT_PASSWORD
                    do
                        if grep -q "^${var}=" .env; then
                            echo "${var}: PRESENT"
                        else
                            echo "${var}: MISSING"
                            echo "ERROR: Required variable ${var} is missing."
                            exit 1
                        fi
                    done

                    echo ""
                    echo "All required MySQL variables are present."
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
                    echo "Stopping existing containers"
                    echo "======================================"

                    docker compose --env-file .env down || true

                    echo "Existing containers stopped."
                '''
            }
        }


        stage('Build and Start') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Building and starting MovieHub"
                    echo "======================================"

                    docker compose --env-file .env up -d --build

                    echo ""
                    echo "Docker Compose started."
                '''
            }
        }


        stage('Wait for Services') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Waiting for services"
                    echo "======================================"

                    echo "Waiting 10 seconds for MySQL/backend..."
                    sleep 10

                    echo ""
                    echo "Current container status:"
                    docker compose --env-file .env ps

                    echo ""
                    echo "Checking MySQL container..."

                    MYSQL_STATUS=$(docker inspect -f '{{.State.Status}}' employee_mysql 2>/dev/null || echo "missing")

                    echo "MySQL status: $MYSQL_STATUS"

                    if [ "$MYSQL_STATUS" != "running" ]; then
                        echo "ERROR: employee_mysql is not running."
                        docker logs employee_mysql --tail 100 || true
                        exit 1
                    fi

                    echo "MySQL is running."


                    echo ""
                    echo "Checking backend container..."

                    BACKEND_STATUS=$(docker inspect -f '{{.State.Status}}' employee_backend 2>/dev/null || echo "missing")

                    echo "Backend status: $BACKEND_STATUS"

                    if [ "$BACKEND_STATUS" != "running" ]; then
                        echo "ERROR: employee_backend is not running."
                        docker logs employee_backend --tail 100 || true
                        exit 1
                    fi

                    echo "Backend is running."


                    echo ""
                    echo "Checking frontend container..."

                    FRONTEND_STATUS=$(docker inspect -f '{{.State.Status}}' employee_frontend 2>/dev/null || echo "missing")

                    echo "Frontend status: $FRONTEND_STATUS"

                    if [ "$FRONTEND_STATUS" != "running" ]; then
                        echo "ERROR: employee_frontend is not running."
                        docker logs employee_frontend --tail 100 || true
                        exit 1
                    fi

                    echo "Frontend is running."
                '''
            }
        }


        stage('Verify Backend API') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Testing Backend API"
                    echo "======================================"

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


        stage('Verify Database') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Checking MySQL database"
                    echo "======================================"

                    docker exec employee_mysql \
                        mysql \
                        -uappuser \
                        -papppass \
                        employee_db \
                        -e "SHOW TABLES;"

                    echo ""
                    echo "Database verification completed."
                '''
            }
        }


        stage('Final Status') {
            steps {
                sh '''
                    echo "======================================"
                    echo "Final Docker Status"
                    echo "======================================"

                    docker compose --env-file .env ps

                    echo ""
                    echo "MovieHub containers:"
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

        failure {
            sh '''
                echo ""
                echo "======================================"
                echo "DEPLOYMENT FAILED"
                echo "======================================"

                echo ""
                echo "----- MySQL logs -----"
                docker logs employee_mysql --tail 100 2>&1 || true

                echo ""
                echo "----- Backend logs -----"
                docker logs employee_backend --tail 100 2>&1 || true

                echo ""
                echo "----- Frontend logs -----"
                docker logs employee_frontend --tail 50 2>&1 || true

                echo ""
                echo "----- Docker Compose status -----"
                docker compose --env-file .env ps || true
            '''
        }

        success {
            echo ''
            echo '======================================'
            echo 'MovieHub deployment completed successfully.'
            echo '======================================'
        }
    }
}
