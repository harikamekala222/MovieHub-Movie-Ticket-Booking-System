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

        stage('Verify') {
            steps {
                sh '''
                    docker compose --env-file .env ps
                '''
            }
        }
    }
}
