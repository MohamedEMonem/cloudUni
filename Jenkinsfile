pipeline{
    agent any
    environment{
        DOCKER_IMAGE_FRONT = 'mohamedemonem/dokkan-frontend'
        DOCKER_IMAGE_BACK = 'mohamedemonem/dokkan-backend'
        EB_APP_NAME = "the-dokkan"
        EB_ENV_NAME = "The-dokkan-env-1"
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
                // 1. Build the Backend
                sh 'docker build -t ${DOCKER_IMAGE_BACK}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_BACK}:latest ./Backend/'
                
                // 2. Build the Frontend (with the AWS API URL injected)
                sh 'docker build --build-arg VITE_API_URL=http://backend:3000/api -f ./Frontend/Dockerfile -t ${DOCKER_IMAGE_FRONT}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_FRONT}:latest ./'
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
                sh 'rm -f deploy.zip'
                sh "sed -i 's/__BUILD_NUMBER__/${BUILD_NUMBER}/g' docker-compose.yml"
                sh '''
                    echo "Packaging deployment files..."
                    if [ -f Backend/.env ]; then
                        echo "Backend/.env found, including in deployment package..."
                        zip -r deploy.zip docker-compose.yml Backend/.env .ebextensions
                    else
                        echo "Backend/.env not found, packaging without it..."
                        zip -r deploy.zip docker-compose.yml .ebextensions
                    fi
                '''
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
                    
                    sh """
                        echo "Deploying new application version to Elastic Beanstalk..."
                        aws elasticbeanstalk update-environment \
                        --region ${AWS_REGION} \
                        --application-name ${EB_APP_NAME} \
                        --environment-name ${EB_ENV_NAME} \
                        --version-label dokkan-${BUILD_NUMBER}
                    """
                    
                    echo "Waiting for Elastic Beanstalk environment to update..."
                    sh """
                        aws elasticbeanstalk wait environment-updated \
                        --region ${AWS_REGION} \
                        --environment-name ${EB_ENV_NAME} \
                        --application-name ${EB_APP_NAME} || echo "Note: Environment update may still be in progress"
                    """
                    
                    echo "Deployment verification..."
                    sh """
                        aws elasticbeanstalk describe-environments \
                        --region ${AWS_REGION} \
                        --environment-names ${EB_ENV_NAME} \
                        --query 'Environments[0].[EnvironmentName,Status,Health,HealthStatus]' \
                        --output table
                    """
                }
            }
        }
    }
}
