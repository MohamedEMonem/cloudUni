pipeline{
    agent any
    environment{
        DOCKER_IMAGE_FRONT = 'mohamedemonem/dokkan-frontend'
        DOCKER_IMAGE_BACK = 'mohamedemonem/dokkan-backend'
        EB_APP_NAME = "Dokkan"
        EB_ENV_NAME = "Dokkan-env"
        AWS_REGION = "us-east-1"
        S3_BUCKET = "prod-dokkan"

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
                sh 'rm -f deploy.zip'
                sh "sed -i 's/__BUILD_NUMBER__/${BUILD_NUMBER}/g' docker-compose.yml"
                sh '''
                    echo "Packaging deployment files..."
                    if [ -f Backend/.env ]; then
                        echo "Backend/.env found, including in deployment package..."
                    else
                        echo "Warning: Backend/.env not found. Please ensure the file exists in your workspace or Jenkins credentials."
                        exit 1
                    fi
                    zip deploy.zip docker-compose.yml Backend/.env
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
                    
                    sh '''
                        echo "Setting environment variables on Elastic Beanstalk from .ebextensions..."
                        
                        # Parse .ebextensions/01_environment.config and extract environment variables
                        if [ -f .ebextensions/01_environment.config ]; then
                            echo "Found .ebextensions/01_environment.config, parsing variables..."
                            
                            # Build option-settings from .ebextensions/01_environment.config
                            OPTIONS=""
                            
                            # Extract environment variables using grep and awk
                            while IFS=: read -r key value; do
                                key=$(echo "$key" | xargs)  # Trim whitespace
                                value=$(echo "$value" | xargs | sed "s/'//g")  # Trim and remove quotes
                                
                                if [ ! -z "$key" ] && [[ ! "$key" =~ ^# ]]; then
                                    # Escape special characters in values
                                    value=$(echo "$value" | sed 's/"/\\"/g')
                                    OPTIONS="${OPTIONS} Namespace=aws:elasticbeanstalk:application:environment,OptionName=${key},Value=\"${value}\""
                                fi
                            done < <(grep -A 100 "aws:elasticbeanstalk:application:environment:" .ebextensions/01_environment.config | grep -v "^option_settings:" | grep -v "^  aws:" | grep -v "^$" | sed 's/^[[:space:]]*//')
                            
                            if [ ! -z "$OPTIONS" ]; then
                                echo "Applying environment variables to ${EB_ENV_NAME}..."
                                aws elasticbeanstalk update-environment \
                                --region ${AWS_REGION} \
                                --application-name ${EB_APP_NAME} \
                                --environment-name ${EB_ENV_NAME} \
                                --option-settings $OPTIONS
                            fi
                        else
                            echo "Warning: .ebextensions/01_environment.config not found"
                        fi
                    '''
                    
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
