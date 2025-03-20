pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Deploy') {
            steps {
                script {
                    // Stop and remove existing containers, then rebuild and start
                    sh '''
                        docker compose down
                        docker compose build --no-cache
                        docker compose up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
} 