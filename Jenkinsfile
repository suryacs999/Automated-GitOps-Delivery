pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node18'
    }

    environment {
        SCANNER_HOME          = tool 'sonar-scanner'
        DOCKER_IMAGE          = 'ci-cd-pipeline'
        DOCKER_REGISTRY       = '<DOCKER-HUB-USERNAME>'
        DOCKER_CREDENTIALS_ID = 'docker-cred'
        MANIFEST_FILE         = 'k8s/deployment.yml'
        GIT_REPO_NAME         = 'DevSecOps-CI-CD-Pipeline-Aws-Eks'
        GIT_USER_NAME         = '<GIT-USERNAME>'
        GIT_EMAIL             = 'GIT-EMAIL'
    }

    stages {

        stage('Clean Workspace') {
            steps { cleanWs() }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: "https://github.com/${env.GIT_USER_NAME}/${env.GIT_REPO_NAME}.git"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectName=DevSecOps-CI-CD-Pipeline-Aws-Eks \
                        -Dsonar.projectKey=DevSecOps-CI-CD-Pipeline-Aws-Eks
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                waitForQualityGate abortPipeline: false,
                credentialsId: 'sonar-token'
            }
        }

        stage('Install Dependencies') {
            steps { sh 'npm install' }
        }

        stage('Trivy File Scan') {
            steps {
                sh 'trivy fs --format table -o trivy-fs-report.txt .'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh """
                    trivy image --format table \
                    -o trivy-image-report.txt \
                    ${DOCKER_IMAGE}:${BUILD_NUMBER}
                """
            }
        }

        stage('Push Docker Image') {
    steps {
        withDockerRegistry(credentialsId: 'docker-cred', url: 'https://index.docker.io/v1/') {
            sh """
                docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${BUILD_NUMBER}
                docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${BUILD_NUMBER}
            """
        }
    }
}

        stage('Update K8s Manifest') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'git-cred',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_PASS')]) {
                    sh """
                        git config user.email "${GIT_EMAIL}"
                        git config user.name "${GIT_USER_NAME}"
                        sed -i 's|image: .*|image: ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${BUILD_NUMBER}|g' ${MANIFEST_FILE}
                        git add ${MANIFEST_FILE}
                        git commit -m "Update image to ${BUILD_NUMBER}" || echo "No changes"
                        git push https://${GIT_USER}:${GIT_PASS}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME}.git HEAD:main
                    """
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '*.txt', allowEmptyArchive: true
        }
    }
}
