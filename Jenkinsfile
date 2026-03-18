pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code checked out successfully'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
                echo 'Dependencies installed'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
                echo 'Linting passed'
            }
        }

        stage('Security Scan') {
            steps {
                sh 'npm audit --audit-level=high'
                echo 'Security scan passed'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
                echo 'All tests passed'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                echo 'Build complete'
            }
        }

        stage('Deploy') {
    steps {
        sh '''
        sudo mkdir -p /var/www/todoapp
        sudo rsync -av --delete . /var/www/todoapp/
        cd /var/www/todoapp
        npm ci --omit=dev

        sudo systemctl restart todoapp

        echo "Waiting for app to start..."
        sleep 5

        echo "Running health check..."

        STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)

        if [ "$STATUS" -ne 200 ]; then
            echo "❌ Health check failed! Status: $STATUS"
            exit 1
        fi

        echo "✅ Health check passed!"
        '''
    }
}

    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo 'All stages passed -- app deployed successfully'
        }
        failure {
            echo 'Pipeline failed -- check logs'
        }
    }
}
