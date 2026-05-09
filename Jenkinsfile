pipeline{
    agent any
    environment{
        DOCKER_IMAGE_FRONT = 'mohamedemonem/dokkan-frontend'
        DOCKER_IMAGE_BACK = 'mohamedemonem/dokkan-backend'
        EB_APP_NAME = "Dokkan"
        EB_ENV_NAME = "Dokkan-env"
        AWS_REGION = "us-east-1"
        S3_BUCKET = "dokkan-s3-europe1"

    }
    stages{

        // stage('Test'){
        //     steps{
        //         sh 'docker build -f backend/Dockerfile.test -t backend-test-image ./backend/'
        //         sh 'docker run --rm backend-test-image'
        // }

        stage('build'){
            steps{
                sh 'docker build -t ${DOCKER_IMAGE_BACK}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_BACK}:latest ./Backend/'
                sh 'docker build -f ./Frontend/Dockerfile -t ${DOCKER_IMAGE_FRONT}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_FRONT}:latest ./'
            }
        }

        stage('push to docker hub'){
            steps{
            withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
            
            // Log in using the variables
            sh 'echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin'
            
            // Push the images
            sh 'docker push ${DOCKER_IMAGE_FRONT}:${BUILD_NUMBER}'
            sh 'docker push ${DOCKER_IMAGE_BACK}:${BUILD_NUMBER}'
            sh 'docker push ${DOCKER_IMAGE_FRONT}:latest'
            sh 'docker push ${DOCKER_IMAGE_BACK}:latest'
        }
            }
        }
       
        stage('package deployment instructions'){
            steps{
                withCredentials([
                    string(credentialsId: 'database-url', variable: 'DATABASE_URL'),
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                ]){
                    sh '''
                        # Create .env file from Jenkins Secrets (Essential only)
                        echo "Creating Backend/.env from Jenkins credentials..."
                        cat > Backend/.env << EOF
# Server
PORT=3000
JWT_SECRET=${JWT_SECRET}
REFRESH_TOKEN_SECRET=secure-refresh-token-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_PREFIX=refresh
REFRESH_COOKIE_NAME=refreshToken
REFRESH_COOKIE_SAMESITE=lax
REFRESH_COOKIE_SECURE=true
REFRESH_COOKIE_PATH=/api/auth

# Frontend CORS origin(s) - UPDATE IN ELASTIC BEANSTALK CONSOLE
CORS_ORIGIN=https://yourdomain.com

# PostgreSQL - Injected from Jenkins Secret
DATABASE_URL=${DATABASE_URL}
POSTGRES_PORT=5432

# Redis - UPDATE IN ELASTIC BEANSTALK CONSOLE if needed
REDIS_HOST=redis.elasticache.amazonaws.com
REDIS_PORT=6379

# Meilisearch
MEILI_MASTER_KEY=masterKey
MEILI_PORT=7700

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ROOT_USER=root
MINIO_ROOT_PASSWORD=rootpassword
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001

# One-shot docker startup behavior
AUTO_SEED=true
DB_WAIT_RETRIES=60

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Dokkan Security <noreply@dokkan.com>"
EOF
                    '''
                }
                
                sh 'rm -f deploy.zip'
                sh "sed -i 's/__BUILD_NUMBER__/${BUILD_NUMBER}/g' docker-compose.yml"
                sh 'zip deploy.zip docker-compose.yml Backend/.env'
            }
        }
        // stage('Upload to S3 (The Artifactory)') {
        //     steps {
        //     }
        // }
        stage('Deploy to Elastic Beanstalk') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'), 
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {

                    sh "aws s3 cp deploy.zip s3://${S3_BUCKET}/deploy-build-${BUILD_NUMBER}.zip"
                    sh """
                        aws elasticbeanstalk create-application-version \
                        --region ${AWS_REGION} \
                        --application-name ${EB_APP_NAME} \
                        --version-label dokkan-${BUILD_NUMBER} \
                        --source-bundle S3Bucket="${S3_BUCKET}",S3Key="deploy-build-${BUILD_NUMBER}.zip"
                    """
                    
                    sh '''
                        echo "Setting environment variables on Elastic Beanstalk..."
                        
                        # Build option-settings array from .env file
                        OPTIONS=""
                        while IFS='=' read -r key value; do
                            if [ ! -z "$key" ] && [[ ! "$key" =~ ^# ]]; then
                                # Escape quotes in values
                                value=$(echo "$value" | sed 's/"/\\"/g')
                                OPTIONS="${OPTIONS} Namespace=aws:elasticbeanstalk:application:environment,OptionName=${key},Value=${value}"
                            fi
                        done < Backend/.env
                        
                        if [ ! -z "$OPTIONS" ]; then
                            aws elasticbeanstalk update-environment \
                            --region ${AWS_REGION} \
                            --application-name ${EB_APP_NAME} \
                            --environment-name ${EB_ENV_NAME} \
                            --option-settings $OPTIONS
                        fi
                    '''
                    
                    sh """
                        aws elasticbeanstalk update-environment \
                        --region ${AWS_REGION} \
                        --application-name ${EB_APP_NAME} \
                        --environment-name ${EB_ENV_NAME} \
                        --version-label dokkan-${BUILD_NUMBER}
                    """
                }
            }
        }
    }
}
